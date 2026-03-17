import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { HardwareItem } from '../types';
import {
  getHardwareLibrary,
  setHardwareLibrary,
  isSeeded,
  markSeeded,
} from '../lib/storage';
import { DEFAULT_HARDWARE } from '../data/default-hardware';

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
  | { type: 'TOGGLE_ACTIVE'; payload: string }
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

    case 'TOGGLE_ACTIVE':
      return {
        hardware: state.hardware.map((item) =>
          item.id === action.payload
            ? { ...item, isActive: !item.isActive, updatedAt: new Date().toISOString() }
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
  addHardware: (item: Omit<HardwareItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateHardware: (id: string, updates: Partial<HardwareItem>) => void;
  deleteHardware: (id: string) => void;
  toggleActive: (id: string) => void;
  importHardware: (items: HardwareItem[]) => void;
  exportHardware: () => HardwareItem[];
  getActiveHardware: () => HardwareItem[];
}

const HardwareContext = createContext<HardwareContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

function loadInitialHardware(): HardwareItem[] {
  if (!isSeeded()) {
    setHardwareLibrary(DEFAULT_HARDWARE);
    markSeeded();
    return DEFAULT_HARDWARE;
  }
  return getHardwareLibrary();
}

export function HardwareProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(hardwareReducer, undefined, () => ({
    hardware: loadInitialHardware(),
  }));

  // Persist to localStorage on every change
  useEffect(() => {
    setHardwareLibrary(state.hardware);
  }, [state.hardware]);

  const addHardware = useCallback(
    (item: Omit<HardwareItem, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const newItem: HardwareItem = {
        ...item,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      dispatch({ type: 'ADD', payload: newItem });
    },
    [],
  );

  const updateHardware = useCallback((id: string, updates: Partial<HardwareItem>) => {
    dispatch({ type: 'UPDATE', payload: { id, updates } });
  }, []);

  const deleteHardware = useCallback((id: string) => {
    dispatch({ type: 'DELETE', payload: id });
  }, []);

  const toggleActive = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_ACTIVE', payload: id });
  }, []);

  const importHardware = useCallback((items: HardwareItem[]) => {
    dispatch({ type: 'IMPORT', payload: items });
  }, []);

  const exportHardware = useCallback((): HardwareItem[] => {
    return state.hardware;
  }, [state.hardware]);

  const getActiveHardware = useCallback((): HardwareItem[] => {
    return state.hardware.filter((item) => item.isActive);
  }, [state.hardware]);

  return (
    <HardwareContext.Provider
      value={{
        hardware: state.hardware,
        addHardware,
        updateHardware,
        deleteHardware,
        toggleActive,
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
