import { useState, useMemo } from 'react';
import type { HardwareItem, RackItem, HardwareCategory } from '../../types';
import { Badge } from '../ui/Badge';
import { HARDWARE_CATEGORIES } from '../../types';

interface HardwareSelectorProps {
  activeHardware: HardwareItem[];
  rackItems: RackItem[];
  onAddItem: (hardwareId: string) => void;
  onUpdateQuantity: (hardwareId: string, quantity: number) => void;
  onRemoveItem: (hardwareId: string) => void;
}

const CATEGORY_BADGE_VARIANT: Record<HardwareCategory, 'blue' | 'gray' | 'green' | 'red' | 'yellow'> = {
  server: 'blue',
  switch: 'green',
  'camera-controller': 'yellow',
  ups: 'red',
  pdu: 'gray',
  storage: 'blue',
  gateway: 'green',
  display: 'yellow',
  accessory: 'gray',
  other: 'gray',
};

function getCategoryLabel(category: HardwareCategory): string {
  const found = HARDWARE_CATEGORIES.find((c) => c.value === category);
  return found ? found.label : category;
}

export function HardwareSelector({
  activeHardware,
  rackItems,
  onAddItem,
  onUpdateQuantity,
}: HardwareSelectorProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<HardwareCategory | 'all'>('all');

  const rackItemMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of rackItems) {
      map.set(item.hardwareId, item.quantity);
    }
    return map;
  }, [rackItems]);

  const filtered = useMemo(() => {
    return activeHardware.filter((hw) => {
      const matchesSearch =
        search === '' ||
        hw.name.toLowerCase().includes(search.toLowerCase()) ||
        hw.model.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === 'all' || hw.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [activeHardware, search, categoryFilter]);

  const categories = useMemo(() => {
    const cats = new Set(activeHardware.map((hw) => hw.category));
    return HARDWARE_CATEGORIES.filter((c) => cats.has(c.value));
  }, [activeHardware]);

  return (
    <div className="flex flex-col gap-4">
      {/* Search input - full width on its own row */}
      <div>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aifi-black-60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            id="hw-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or model..."
            className="w-full rounded-lg border border-aifi-gray bg-white py-2.5 pl-10 pr-3 text-sm text-aifi-black placeholder:text-aifi-black-60/50 transition-colors focus:border-aifi-blue focus:outline-none focus:ring-2 focus:ring-aifi-blue"
          />
        </div>
      </div>

      {/* Category filter pills - own row, wrapping naturally */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setCategoryFilter('all')}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            categoryFilter === 'all'
              ? 'bg-aifi-blue text-white'
              : 'bg-aifi-gray-50 text-aifi-black-60 hover:bg-aifi-gray'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => setCategoryFilter(cat.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              categoryFilter === cat.value
                ? 'bg-aifi-blue text-white'
                : 'bg-aifi-gray-50 text-aifi-black-60 hover:bg-aifi-gray'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="max-h-80 overflow-y-auto rounded-lg border border-aifi-gray">
        {filtered.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-aifi-black-60">
            No hardware items found. Try adjusting your search or filter.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-aifi-gray-50">
              <tr>
                <th className="px-4 py-2.5 text-left font-semibold text-aifi-black">Item</th>
                <th className="px-4 py-2.5 text-left font-semibold text-aifi-black">Category</th>
                <th className="px-4 py-2.5 text-right font-semibold text-aifi-black">Power (W)</th>
                <th className="px-4 py-2.5 text-right font-semibold text-aifi-black">Peak (W)</th>
                <th className="px-4 py-2.5 text-center font-semibold text-aifi-black">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((hw) => {
                const inRackQty = rackItemMap.get(hw.id);
                return (
                  <tr
                    key={hw.id}
                    className="border-t border-aifi-gray/50 hover:bg-aifi-blue-10/50 transition-colors"
                  >
                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-aifi-black">{hw.name}</div>
                      <div className="text-xs text-aifi-black-60">{hw.model}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={CATEGORY_BADGE_VARIANT[hw.category]}>
                        {getCategoryLabel(hw.category)}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{hw.powerWatts}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{hw.peakPowerWatts}</td>
                    <td className="px-4 py-2.5">
                      {inRackQty !== undefined ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(hw.id, inRackQty - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-aifi-gray-50 text-aifi-black hover:bg-aifi-gray transition-colors"
                            aria-label={`Decrease quantity of ${hw.name}`}
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-6 text-center font-bold text-aifi-black tabular-nums">
                            {inRackQty}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(hw.id, inRackQty + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-aifi-blue text-white hover:bg-blue-600 transition-colors"
                            aria-label={`Increase quantity of ${hw.name}`}
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={() => onAddItem(hw.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-aifi-blue text-white hover:bg-blue-600 transition-colors"
                            aria-label={`Add ${hw.name} to rack`}
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
