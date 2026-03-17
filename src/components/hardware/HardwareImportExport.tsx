import React, { useRef } from 'react';
import type { HardwareItem } from '../../types';
import { useHardware } from '../../context/HardwareContext';
import { useToast } from '../ui/Toast';
import { Button } from '../ui/Button';

export function HardwareImportExport() {
  const { exportHardware, importHardware } = useHardware();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    try {
      const data = exportHardware();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'hardware-library.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addToast('Hardware library exported successfully', 'success');
    } catch {
      addToast('Failed to export hardware library', 'error');
    }
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!Array.isArray(parsed)) {
          addToast('Invalid file: expected an array of hardware items', 'error');
          return;
        }

        // Basic validation: check that each item has required fields
        const isValid = parsed.every(
          (item: unknown) =>
            typeof item === 'object' &&
            item !== null &&
            'name' in item &&
            'model' in item &&
            'category' in item &&
            'powerWatts' in item
        );

        if (!isValid) {
          addToast('Invalid file: items are missing required fields (name, model, category, powerWatts)', 'error');
          return;
        }

        importHardware(parsed as HardwareItem[]);
        addToast(`Imported ${parsed.length} hardware items`, 'success');
      } catch {
        addToast('Failed to parse JSON file. Please check the file format.', 'error');
      }
    };

    reader.onerror = () => {
      addToast('Failed to read the file', 'error');
    };

    reader.readAsText(file);

    // Reset file input so the same file can be re-imported if needed
    e.target.value = '';
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="sm" onClick={handleExport}>
        <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export JSON
      </Button>
      <Button variant="secondary" size="sm" onClick={handleImportClick}>
        <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Import JSON
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Import hardware library JSON file"
      />
    </div>
  );
}
