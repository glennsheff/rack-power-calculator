import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { HardwareItem, HardwareStatus } from '../types';
import {
  getHardwareLibrary,
  upsertHardwareItem,
  deleteHardwareItem as deleteHardwareFromDB,
  bulkUpsertHardware,
} from '../lib/storage';
import { DEFAULT_HARDWARE } from '../data/default-hardware';
import { supabase } from '../lib/supabase';

// ---------------------------------------------------------------------------
// State & actions
// ---------------------------------------------------------------------------

interface HardwareState {
  hardware: HardwareItem[];
}

type HardwareAction =
  | { type: 'SET'; payload: HardwareItem[] }
  | { type: 'ADD'; payload: HardwareItem }
  | { type: 'UPDATE'; payload: { id: string; updates: Partial<HardwareItem> } }
  | { type: 'DELETE'; payload: string }
  | { type: 'SET_STATUS'; payload: { id: string; status: HardwareStatus } }
  | { type: 'IMPORT'; payload: HardwareItem[] };

function hardwareReducer(state: HardwareState, action: HardwareAction): HardwareState {
  switch (action.type) {
    case 'SET':
      return { hardware: action.payload };

    case 'ADD':
      return { hardware: [...state.hardware, action.payload] };

    case 'UPDATE':
      return {
        hardware: state.hardware.map((item) =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : item,
        ),
      };

    case 'DELETE':
      return {
        hardware: state.hardware.filter((item) => item.id !== action.payload),
      };

    case 'SET_STATUS':
      return {
        hardware: state.hardware.map((item) =>
          item.id === action.payload.id
            ? { ...item, status: action.payload.status, updatedAt: new Date().toISOString() }
            : item,
        ),
      };

    case 'IMPORT':
      return { hardware: action.payload };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface HardwareContextValue {
  hardware: HardwareItem[];
  loading: boolean;
  addHardware: (item: Omit<HardwareItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateHardware: (id: string, updates: Partial<HardwareItem>) => void;
  deleteHardware: (id: string) => void;
  setStatus: (id: string, status: HardwareStatus) => void;
  importHardware: (items: HardwareItem[]) => void;
  exportHardware: () => HardwareItem[];
  getActiveHardware: () => HardwareItem[];
}

const HardwareContext = createContext<HardwareContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function HardwareProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(hardwareReducer, { hardware: [] });
  const [loading, setLoading] = useState(true);

  // Load hardware from Supabase on mount, seed if empty
  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      try {
        let items = await getHardwareLibrary();

        // If the database is empty, seed it with defaults
        if (items.length === 0) {
          await bulkUpsertHardware(DEFAULT_HARDWARE);
          items = DEFAULT_HARDWARE;
        }

        if (!cancelled) {
          dispatch({ type: 'SET', payload: items });
        }
      } catch (err) {
        console.error('Failed to initialize hardware:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  // Subscribe to real-time changes from other users
  useEffect(() => {
    const channel = supabase
      .channel('hardware-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hardware_items' },
        async () => {
          // Re-fetch all hardware when any change happens
          const items = await getHardwareLibrary();
          dispatch({ type: 'SET', payload: items });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addHardware = useCallback(
    async (item: Omit<HardwareItem, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const newItem: HardwareItem = {
        ...item,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      dispatch({ type: 'ADD', payload: newItem });
      await upsertHardwareItem(newItem);
    },
    [],
  );

  const updateHardware = useCallback(async (id: string, updates: Partial<HardwareItem>) => {
    const now = new Date().toISOString();
    dispatch({ type: 'UPDATE', payload: { id, updates } });

    // We need the full updated item for the upsert
    // Find current item, merge updates, send to DB
    const current = state.hardware.find((h) => h.id === id);
    if (current) {
      await upsertHardwareItem({ ...current, ...updates, updatedAt: now });
    }
  }, [state.hardware]);

  const deleteHardware = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE', payload: id });
    await deleteHardwareFromDB(id);
  }, []);

  const setStatus = useCallback(async (id: string, status: HardwareStatus) => {
    const now = new Date().toISOString();
    dispatch({ type: 'SET_STATUS', payload: { id, status } });

    const current = state.hardware.find((h) => h.id === id);
    if (current) {
      await upsertHardwareItem({ ...current, status, updatedAt: now });
    }
  }, [state.hardware]);

  const importHardware = useCallback(async (items: HardwareItem[]) => {
    dispatch({ type: 'IMPORT', payload: items });
    await bulkUpsertHardware(items);
  }, []);

  const exportHardware = useCallback((): HardwareItem[] => {
    return state.hardware;
  }, [state.hardware]);

  const getActiveHardware = useCallback((): HardwareItem[] => {
    return state.hardware.filter((item) => item.status === 'active');
  }, [state.hardware]);

  return (
    <HardwareContext.Provider
      value={{
        hardware: state.hardware,
        loading,
        addHardware,
        updateHardware,
        deleteHardware,
        setStatus,
        importHardware,
        exportHardware,
        getActiveHardware,
      }}
    >
      {children}
    </HardwareContext.Provider>
  );
}

export function useHardware(): HardwareContextValue {
  const context = useContext(HardwareContext);
  if (!context) {
    throw new Error('useHardware must be used within a HardwareProvider');
  }
  return context;
}

export default HardwareContext;
