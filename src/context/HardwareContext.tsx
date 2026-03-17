import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { HardwareItem, HardwareStatus } from '../types';
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

// Current schema version — bump this when the default data or schema changes
const SCHEMA_VERSION = 2;

function getSchemaVersion(): number {
  try {
    const raw = localStorage.getItem('aifi-rack-schema-version');
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

function setSchemaVersion(v: number): void {
  localStorage.setItem('aifi-rack-schema-version', v.toString());
}

function migrateHardware(items: HardwareItem[]): HardwareItem[] {
  return items.map((item) => {
    const migrated = { ...item };

    // v1 → v2: isActive (boolean) → status (HardwareStatus)
    if (!('status' in migrated) || !migrated.status) {
      const legacy = item as unknown as Record<string, unknown>;
      if (legacy.isActive === false) {
        migrated.status = 'eol';
      } else {
        migrated.status = 'active';
      }
      delete (migrated as Record<string, unknown>).isActive;
    }

    // v1 → v2: camera-controller → camera or controller
    if ((migrated.category as string) === 'camera-controller') {
      const nameLower = migrated.name.toLowerCase();
      if (nameLower.includes('controller') || nameLower.includes('dataprobe') || nameLower.includes('raspberry')) {
        migrated.category = 'controller';
      } else {
        migrated.category = 'camera';
      }
    }

    return migrated;
  });
}

function loadInitialHardware(): HardwareItem[] {
  if (!isSeeded()) {
    // First ever visit — seed with defaults
    setHardwareLibrary(DEFAULT_HARDWARE);
    markSeeded();
    setSchemaVersion(SCHEMA_VERSION);
    return DEFAULT_HARDWARE;
  }

  let existing = getHardwareLibrary();
  const currentVersion = getSchemaVersion();

  if (currentVersion < SCHEMA_VERSION) {
    // Migrate existing items to new schema
    existing = migrateHardware(existing);

    // Merge in any new seed items that don't exist yet (by seed id)
    const existingIds = new Set(existing.map((h) => h.id));
    const newSeedItems = DEFAULT_HARDWARE.filter((d) => !existingIds.has(d.id));
    if (newSeedItems.length > 0) {
      existing = [...existing, ...newSeedItems];
    }

    setHardwareLibrary(existing);
    setSchemaVersion(SCHEMA_VERSION);
  }

  return existing;
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

  const setStatus = useCallback((id: string, status: HardwareStatus) => {
    dispatch({ type: 'SET_STATUS', payload: { id, status } });
  }, []);

  const importHardware = useCallback((items: HardwareItem[]) => {
    dispatch({ type: 'IMPORT', payload: items });
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
