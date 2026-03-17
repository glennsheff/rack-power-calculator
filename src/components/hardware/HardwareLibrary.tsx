import { useState, useMemo } from 'react';
import type { HardwareItem, HardwareCategory, HardwareStatus } from '../../types';
import { HARDWARE_CATEGORIES } from '../../types';
import { useHardware } from '../../context/HardwareContext';
import { useToast } from '../ui/Toast';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { HardwareForm } from './HardwareForm';
import { HardwareTable } from './HardwareTable';
import { HardwareImportExport } from './HardwareImportExport';

export function HardwareLibrary() {
  const { hardware, addHardware, updateHardware, deleteHardware, setStatus } = useHardware();
  const { addToast } = useToast();

  const [selectedCategory, setSelectedCategory] = useState<HardwareCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HardwareItem | null>(null);

  const filteredItems = useMemo(() => {
    let result = hardware;

    if (selectedCategory) {
      result = result.filter((item) => item.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.model.toLowerCase().includes(query)
      );
    }

    return result;
  }, [hardware, selectedCategory, searchQuery]);

  function openAddModal() {
    setEditingItem(null);
    setModalOpen(true);
  }

  function openEditModal(item: HardwareItem) {
    setEditingItem(item);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingItem(null);
  }

  function handleFormSubmit(data: Omit<HardwareItem, 'id' | 'createdAt' | 'updatedAt'>) {
    if (editingItem) {
      updateHardware(editingItem.id, data);
      addToast(`"${data.name}" updated successfully`, 'success');
    } else {
      addHardware(data);
      addToast(`"${data.name}" added to the library`, 'success');
    }
    closeModal();
  }

  function handleDelete(id: string) {
    const item = hardware.find((h) => h.id === id);
    deleteHardware(id);
    addToast(`"${item?.name ?? 'Item'}" deleted`, 'success');
  }

  function handleSetStatus(id: string, status: HardwareStatus) {
    const item = hardware.find((h) => h.id === id);
    setStatus(id, status);
    if (item) {
      const labels: Record<HardwareStatus, string> = { active: 'Active', 'in-testing': 'In Testing', eol: 'EOL' };
      addToast(`"${item.name}" set to ${labels[status]}`, 'info');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-aifi-black">Hardware Library</h1>
          <p className="mt-1 text-sm text-aifi-black-60">
            Manage the catalogue of hardware items available for rack configurations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <HardwareImportExport />
          <Button onClick={openAddModal}>
            <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Hardware
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Category pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              selectedCategory === null
                ? 'bg-aifi-blue text-white'
                : 'bg-aifi-gray-50 text-aifi-black-60 hover:bg-aifi-gray'
            }`}
          >
            All ({hardware.length})
          </button>
          {HARDWARE_CATEGORIES.map((cat) => {
            const count = hardware.filter((h) => h.category === cat.value).length;
            if (count === 0) return null;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  selectedCategory === cat.value
                    ? 'bg-aifi-blue text-white'
                    : 'bg-aifi-gray-50 text-aifi-black-60 hover:bg-aifi-gray'
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aifi-black-60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or model..."
            className="w-full rounded-lg border border-aifi-gray bg-white py-2 pl-10 pr-4 text-sm text-aifi-black placeholder:text-aifi-black-60/50 transition-colors focus:border-aifi-blue focus:outline-none focus:ring-2 focus:ring-aifi-blue"
            aria-label="Search hardware"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-aifi-black-60 hover:text-aifi-black"
              aria-label="Clear search"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <HardwareTable
        items={filteredItems}
        onEdit={openEditModal}
        onSetStatus={handleSetStatus}
        onDelete={handleDelete}
      />

      {/* Item count */}
      {filteredItems.length > 0 && (
        <p className="text-xs text-aifi-black-60">
          Showing {filteredItems.length} of {hardware.length} items
        </p>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingItem ? `Edit: ${editingItem.name}` : 'Add New Hardware'}
        size="lg"
      >
        <HardwareForm
          item={editingItem ?? undefined}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}
