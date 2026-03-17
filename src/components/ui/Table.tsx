import React from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No data to display.',
  className = '',
}: TableProps<T>) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-aifi-gray ${className}`}>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-aifi-gray bg-aifi-gray-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 font-semibold text-aifi-black-80 ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-aifi-black-60"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={keyExtractor(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-aifi-gray/50 transition-colors last:border-b-0 ${
                  index % 2 === 1 ? 'bg-aifi-gray-50/40' : 'bg-white'
                } ${onRowClick ? 'cursor-pointer hover:bg-aifi-blue-10' : 'hover:bg-aifi-gray-50/60'}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 text-aifi-black ${col.className || ''}`}>
                    {col.render ? col.render(row) : (row[col.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
