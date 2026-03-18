import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { RackConfiguration, RackItem } from '../types';
import {
  getRackConfigurations,
  saveRackConfiguration as saveRackConfigToDB,
  deleteRackConfiguration as deleteRackConfigFromDB,
} from '../lib/storage';

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

function createEmptyConfig(): RackConfiguration {
  return {
    id: crypto.randomUUID(),
    name: '',
    storeName: '',
    region: 'US',
    items: [],
    desiredRuntimeMinutes: 15,
    includeRedundancy: false,
    ambientTempCelsius: 25,
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// State & actions
// ---------------------------------------------------------------------------

interface RackState {
  currentConfig: RackConfiguration;
  savedConfigs: RackConfiguration[];
}

type RackAction =
  | { type: 'SET_SAVED'; payload: RackConfiguration[] }
  | { type: 'UPDATE_CONFIG'; payload: Partial<RackConfiguration> }
  | { type: 'ADD_ITEM'; payload: string }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_ITEM_QTY'; payload: { hardwareId: string; quantity: number } }
  | { type: 'CLEAR_ITEMS' }
  | { type: 'SAVE_CURRENT' }
  | { type: 'LOAD_CONFIG'; payload: string }
  | { type: 'DELETE_CONFIG'; payload: string }
  | { type: 'NEW_CONFIG' };

function rackReducer(state: RackState, action: RackAction): RackState {
  switch (action.type) {
    case 'SET_SAVED':
      return { ...state, savedConfigs: action.payload };

    case 'UPDATE_CONFIG':
      return {
        ...state,
        currentConfig: {
          ...state.currentConfig,
          ...action.payload,
          updatedAt: new Date().toISOString(),
        },
      };

    case 'ADD_ITEM': {
      const existing = state.currentConfig.items.find(
        (i) => i.hardwareId === action.payload,
      );
      let newItems: RackItem[];
      if (existing) {
        newItems = state.currentConfig.items.map((i) =>
          i.hardwareId === action.payload
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        );
      } else {
        newItems = [
          ...state.currentConfig.items,
          { hardwareId: action.payload, quantity: 1 },
        ];
      }
      return {
        ...state,
        currentConfig: {
          ...state.currentConfig,
          items: newItems,
          updatedAt: new Date().toISOString(),
        },
      };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        currentConfig: {
          ...state.currentConfig,
          items: state.currentConfig.items.filter(
            (i) => i.hardwareId !== action.payload,
          ),
          updatedAt: new Date().toISOString(),
        },
      };

    case 'UPDATE_ITEM_QTY': {
      const { hardwareId, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          currentConfig: {
            ...state.currentConfig,
            items: state.currentConfig.items.filter(
              (i) => i.hardwareId !== hardwareId,
            ),
            updatedAt: new Date().toISOString(),
          },
        };
      }
      return {
        ...state,
        currentConfig: {
          ...state.currentConfig,
          items: state.currentConfig.items.map((i) =>
            i.hardwareId === hardwareId ? { ...i, quantity } : i,
          ),
          updatedAt: new Date().toISOString(),
        },
      };
    }

    case 'CLEAR_ITEMS':
      return {
        ...state,
        currentConfig: {
          ...state.currentConfig,
          items: [],
          updatedAt: new Date().toISOString(),
        },
      };

    case 'SAVE_CURRENT': {
      const configToSave: RackConfiguration = {
        ...state.currentConfig,
        updatedAt: new Date().toISOString(),
      };
      const existingIdx = state.savedConfigs.findIndex(
        (c) => c.id === configToSave.id,
      );
      let newSaved: RackConfiguration[];
      if (existingIdx >= 0) {
        newSaved = [...state.savedConfigs];
        newSaved[existingIdx] = configToSave;
      } else {
        newSaved = [...state.savedConfigs, configToSave];
      }
      return {
        ...state,
        currentConfig: configToSave,
        savedConfigs: newSaved,
      };
    }

    case 'LOAD_CONFIG': {
      const target = state.savedConfigs.find((c) => c.id === action.payload);
      if (!target) return state;
      return {
        ...state,
        currentConfig: { ...target },
      };
    }

    case 'DELETE_CONFIG': {
      const filtered = state.savedConfigs.filter(
        (c) => c.id !== action.payload,
      );
      const currentWasDeleted = state.currentConfig.id === action.payload;
      return {
        ...state,
        savedConfigs: filtered,
        currentConfig: currentWasDeleted ? createEmptyConfig() : state.currentConfig,
      };
    }

    case 'NEW_CONFIG':
      return {
        ...state,
        currentConfig: createEmptyConfig(),
      };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface RackContextValue {
  currentConfig: RackConfiguration;
  savedConfigs: RackConfiguration[];
  loading: boolean;
  updateConfig: (updates: Partial<RackConfiguration>) => void;
  addItem: (hardwareId: string) => void;
  removeItem: (hardwareId: string) => void;
  updateItemQuantity: (hardwareId: string, quantity: number) => void;
  clearItems: () => void;
  saveCurrentConfig: () => void;
  loadConfig: (id: string) => void;
  deleteConfig: (id: string) => void;
  newConfig: () => void;
}

const RackContext = createContext<RackContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function RackProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(rackReducer, {
    currentConfig: createEmptyConfig(),
    savedConfigs: [],
  });
  const [loading, setLoading] = useState(true);

  // Load saved configs from Supabase on mount
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const configs = await getRackConfigurations();
        dispatch({ type: 'SET_SAVED', payload: configs });
      } catch (err) {
        console.error('Failed to load rack configs:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const updateConfig = useCallback(
    (updates: Partial<RackConfiguration>) => {
      dispatch({ type: 'UPDATE_CONFIG', payload: updates });
    },
    [],
  );

  const addItem = useCallback((hardwareId: string) => {
    dispatch({ type: 'ADD_ITEM', payload: hardwareId });
  }, []);

  const removeItem = useCallback((hardwareId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: hardwareId });
  }, []);

  const updateItemQuantity = useCallback(
    (hardwareId: string, quantity: number) => {
      dispatch({ type: 'UPDATE_ITEM_QTY', payload: { hardwareId, quantity } });
    },
    [],
  );

  const clearItems = useCallback(() => {
    dispatch({ type: 'CLEAR_ITEMS' });
  }, []);

  const saveCurrentConfig = useCallback(async () => {
    dispatch({ type: 'SAVE_CURRENT' });
    // Persist to Supabase — use current state via a small delay to get the updated config
    // We need to read from the reducer after dispatch, so we schedule the save
    const configToSave = {
      ...state.currentConfig,
      updatedAt: new Date().toISOString(),
    };
    await saveRackConfigToDB(configToSave);
  }, [state.currentConfig]);

  const loadConfig = useCallback((id: string) => {
    dispatch({ type: 'LOAD_CONFIG', payload: id });
  }, []);

  const deleteConfig = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE_CONFIG', payload: id });
    await deleteRackConfigFromDB(id);
  }, []);

  const newConfig = useCallback(() => {
    dispatch({ type: 'NEW_CONFIG' });
  }, []);

  return (
    <RackContext.Provider
      value={{
        currentConfig: state.currentConfig,
        savedConfigs: state.savedConfigs,
        loading,
        updateConfig,
        addItem,
        removeItem,
        updateItemQuantity,
        clearItems,
        saveCurrentConfig,
        loadConfig,
        deleteConfig,
        newConfig,
      }}
    >
      {children}
    </RackContext.Provider>
  );
}

export function useRack(): RackContextValue {
  const context = useContext(RackContext);
  if (!context) {
    throw new Error('useRack must be used within a RackProvider');
  }
  return context;
}

export default RackContext;
