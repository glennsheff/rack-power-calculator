import { useState } from 'react';
import type { HardwareItem } from '../../types';
import { HARDWARE_CATEGORIES } from '../../types';
import { Badge } from '../ui/Badge';

interface HardwareTableProps {
  items: HardwareItem[];
  onEdit: (item: HardwareItem) => void;
  onToggleActive: (id: string) => void;
  onDelete: (id: string) => void;
}

type SortKey = 'name' | 'model' | 'category' | 'powerWatts' | 'peakPowerWatts' | 'heatOutputBTU' | 'rackUnits' | 'isActive';
type SortDir = 'asc' | 'desc';

function getCategoryLabel(value: string): string {
  return HARDWARE_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

function getCategoryBadgeVariant(category: string): 'blue' | 'gray' | 'green' | 'yellow' | 'red' {
  switch (category) {
    case 'server':
      return 'blue';
    case 'switch':
      return 'green';
    case 'ups':
    case 'pdu':
      return 'yellow';
    case 'gateway':
      return 'blue';
    default:
      return 'gray';
  }
}

export function HardwareTable({ items, onEdit, onToggleActive, onDelete }: HardwareTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sorted = [...items].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    const dir = sortDir === 'asc' ? 1 : -1;

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal) * dir;
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * dir;
    }
    if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
      return (Number(aVal) - Number(bVal)) * dir;
    }
    return 0;
  });

  function SortArrow({ column }: { column: SortKey }) {
    if (sortKey !== column) return null;
    return (
      <svg
        className={`ml-1 inline-block h-3.5 w-3.5 transition-transform ${sortDir === 'desc' ? 'rotate-180' : ''}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    );
  }

  function handleDeleteClick(id: string) {
    if (confirmDeleteId === id) {
      onDelete(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
    }
  }

  // Reset confirm state when clicking elsewhere
  function handleRowMouseLeave() {
    setConfirmDeleteId(null);
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-aifi-gray py-16 text-center">
        <svg className="mb-3 h-12 w-12 text-aifi-black-60/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p className="text-sm font-semibold text-aifi-black-60">No hardware items found</p>
        <p className="mt-1 text-xs text-aifi-black-60/70">Add hardware items to get started or adjust your filters.</p>
      </div>
    );
  }

  const headerClass = 'cursor-pointer select-none whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-aifi-black-60 transition-colors hover:text-aifi-black';

  return (
    <div className="overflow-x-auto rounded-xl border border-aifi-gray">
      <table className="w-full text-sm">
        <thead className="border-b border-aifi-gray bg-aifi-gray-50">
          <tr>
            <th className={headerClass} onClick={() => handleSort('name')}>
              Name <SortArrow column="name" />
            </th>
            <th className={headerClass} onClick={() => handleSort('model')}>
              Model <SortArrow column="model" />
            </th>
            <th className={headerClass} onClick={() => handleSort('category')}>
              Category <SortArrow column="category" />
            </th>
            <th className={`${headerClass} text-right`} onClick={() => handleSort('powerWatts')}>
              Power (W) <SortArrow column="powerWatts" />
            </th>
            <th className={`${headerClass} text-right`} onClick={() => handleSort('peakPowerWatts')}>
              Peak (W) <SortArrow column="peakPowerWatts" />
            </th>
            <th className={`${headerClass} text-right`} onClick={() => handleSort('heatOutputBTU')}>
              BTU/hr <SortArrow column="heatOutputBTU" />
            </th>
            <th className={`${headerClass} text-right`} onClick={() => handleSort('rackUnits')}>
              Rack U <SortArrow column="rackUnits" />
            </th>
            <th className={headerClass} onClick={() => handleSort('isActive')}>
              Status <SortArrow column="isActive" />
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-aifi-black-60">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-aifi-gray/60">
          {sorted.map((item) => (
            <tr
              key={item.id}
              className={`transition-colors hover:bg-aifi-gray-50/60 ${!item.isActive ? 'opacity-50' : ''}`}
              onMouseLeave={handleRowMouseLeave}
            >
              <td className="px-4 py-3 font-medium text-aifi-black">{item.name}</td>
              <td className="px-4 py-3 text-aifi-black-80">{item.model}</td>
              <td className="px-4 py-3">
                <Badge variant={getCategoryBadgeVariant(item.category)}>
                  {getCategoryLabel(item.category)}
                </Badge>
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-aifi-black-80">
                {item.powerWatts.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-aifi-black-80">
                {item.peakPowerWatts.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-aifi-black-80">
                {item.heatOutputBTU.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-aifi-black-80">
                {item.rackUnits}
              </td>
              <td className="px-4 py-3">
                <Badge variant={item.isActive ? 'green' : 'red'}>
                  {item.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  {/* Edit */}
                  <button
                    onClick={() => onEdit(item)}
                    className="rounded-lg p-1.5 text-aifi-black-60 transition-colors hover:bg-aifi-blue-10 hover:text-aifi-blue focus:outline-none focus:ring-2 focus:ring-aifi-blue"
                    aria-label={`Edit ${item.name}`}
                    title="Edit"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>

                  {/* Toggle active */}
                  <button
                    onClick={() => onToggleActive(item.id)}
                    className="rounded-lg p-1.5 text-aifi-black-60 transition-colors hover:bg-aifi-blue-10 hover:text-aifi-blue focus:outline-none focus:ring-2 focus:ring-aifi-blue"
                    aria-label={item.isActive ? `Deactivate ${item.name}` : `Activate ${item.name}`}
                    title={item.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {item.isActive ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    )}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteClick(item.id)}
                    className={`rounded-lg p-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 ${
                      confirmDeleteId === item.id
                        ? 'bg-red-50 text-red-600'
                        : 'text-aifi-black-60 hover:bg-red-50 hover:text-red-500'
                    }`}
                    aria-label={confirmDeleteId === item.id ? `Confirm delete ${item.name}` : `Delete ${item.name}`}
                    title={confirmDeleteId === item.id ? 'Click again to confirm' : 'Delete'}
                  >
                    {confirmDeleteId === item.id ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
