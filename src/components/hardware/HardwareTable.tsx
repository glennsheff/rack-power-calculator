import { useState } from 'react';
import type { HardwareItem, HardwareStatus } from '../../types';
import { HARDWARE_CATEGORIES, HARDWARE_STATUSES } from '../../types';
import { Badge } from '../ui/Badge';

interface HardwareTableProps {
  items: HardwareItem[];
  onEdit: (item: HardwareItem) => void;
  onSetStatus: (id: string, status: HardwareStatus) => void;
  onDelete: (id: string) => void;
}

type SortKey = 'name' | 'model' | 'category' | 'powerWatts' | 'peakPowerWatts' | 'heatOutputBTU' | 'rackUnits' | 'status';
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
    case 'camera':
      return 'yellow';
    case 'controller':
      return 'blue';
    case 'ups':
    case 'pdu':
      return 'yellow';
    case 'gateway':
      return 'blue';
    default:
      return 'gray';
  }
}

export function HardwareTable({ items, onEdit, onSetStatus, onDelete }: HardwareTableProps) {
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
      // Auto-clear confirmation after 3 seconds
      setTimeout(() => {
        setConfirmDeleteId((current) => (current === id ? null : current));
      }, 3000);
    }
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
            <th className={headerClass} onClick={() => handleSort('status')}>
              Status <SortArrow column="status" />
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
              className={`transition-colors hover:bg-aifi-gray-50/60 ${item.status === 'eol' ? 'opacity-50' : ''}`}
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
                <select
                  value={item.status}
                  onChange={(e) => onSetStatus(item.id, e.target.value as HardwareStatus)}
                  className={`cursor-pointer rounded-full px-2.5 py-1 text-xs font-semibold border-0 focus:outline-none focus:ring-2 focus:ring-aifi-blue ${
                    item.status === 'active'
                      ? 'bg-green-50 text-green-700'
                      : item.status === 'in-testing'
                      ? 'bg-yellow-50 text-yellow-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {HARDWARE_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
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

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteClick(item.id)}
                    className={`rounded-lg p-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 ${
                      confirmDeleteId === item.id
                        ? 'bg-red-100 text-red-600'
                        : 'text-aifi-black-60 hover:bg-red-50 hover:text-red-500'
                    }`}
                    aria-label={confirmDeleteId === item.id ? `Confirm delete ${item.name}` : `Delete ${item.name}`}
                    title={confirmDeleteId === item.id ? 'Click again to confirm delete' : 'Delete'}
                  >
                    {confirmDeleteId === item.id ? (
                      <span className="flex items-center gap-1 text-xs font-semibold">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Confirm
                      </span>
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
