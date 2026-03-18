import React, { useState } from 'react';
import type { HardwareItem, HardwareCategory, HardwareStatus } from '../../types';
import { HARDWARE_CATEGORIES, HARDWARE_STATUSES } from '../../types';
import { Input, TextArea } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface HardwareFormProps {
  item?: HardwareItem;
  onSubmit: (data: Omit<HardwareItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

interface FormData {
  name: string;
  model: string;
  category: HardwareCategory;
  status: HardwareStatus;
  poePowered: boolean;
  powerWatts: string;
  peakPowerWatts: string;
  heatOutputBTU: string;
  powerSupplyCount: string;
  powerSupplyType: string;
  rackUnits: string;
  weight_kg: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  model?: string;
  powerWatts?: string;
  peakPowerWatts?: string;
  heatOutputBTU?: string;
  powerSupplyCount?: string;
  rackUnits?: string;
  weight_kg?: string;
}

export function HardwareForm({ item, onSubmit, onCancel }: HardwareFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: item?.name ?? '',
    model: item?.model ?? '',
    category: item?.category ?? 'server',
    status: item?.status ?? 'active',
    poePowered: item?.poePowered ?? false,
    powerWatts: item?.powerWatts?.toString() ?? '',
    peakPowerWatts: item?.peakPowerWatts?.toString() ?? '',
    heatOutputBTU: item?.heatOutputBTU?.toString() ?? '0',
    powerSupplyCount: item?.powerSupplyCount?.toString() ?? '1',
    powerSupplyType: item?.powerSupplyType ?? 'IEC C14',
    rackUnits: item?.rackUnits?.toString() ?? '1',
    weight_kg: item?.weight_kg?.toString() ?? '0',
    notes: item?.notes ?? '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
    }

    const power = Number(formData.powerWatts);
    if (formData.powerWatts === '' || isNaN(power)) {
      newErrors.powerWatts = 'Power draw is required';
    } else if (power < 0) {
      newErrors.powerWatts = 'Power draw must be 0 or greater';
    }

    const peak = Number(formData.peakPowerWatts);
    if (formData.peakPowerWatts === '' || isNaN(peak)) {
      newErrors.peakPowerWatts = 'Peak power is required';
    } else if (peak < 0) {
      newErrors.peakPowerWatts = 'Peak power must be 0 or greater';
    } else if (!isNaN(power) && peak < power) {
      newErrors.peakPowerWatts = 'Peak power must be greater than or equal to power draw';
    }

    const btu = Number(formData.heatOutputBTU);
    if (formData.heatOutputBTU !== '' && !isNaN(btu) && btu < 0) {
      newErrors.heatOutputBTU = 'Heat output must be 0 or greater';
    }

    const psuCount = Number(formData.powerSupplyCount);
    if (formData.powerSupplyCount !== '' && !isNaN(psuCount) && psuCount < 0) {
      newErrors.powerSupplyCount = 'Must be 0 or greater';
    }

    const ru = Number(formData.rackUnits);
    if (formData.rackUnits !== '' && !isNaN(ru) && ru < 0) {
      newErrors.rackUnits = 'Must be 0 or greater';
    }

    const weight = Number(formData.weight_kg);
    if (formData.weight_kg !== '' && !isNaN(weight) && weight < 0) {
      newErrors.weight_kg = 'Must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const powerWatts = Number(formData.powerWatts);
    const heatBTU = Number(formData.heatOutputBTU);

    onSubmit({
      name: formData.name.trim(),
      model: formData.model.trim(),
      category: formData.category,
      status: formData.status,
      poePowered: formData.poePowered,
      powerWatts,
      peakPowerWatts: Number(formData.peakPowerWatts),
      heatOutputBTU: heatBTU > 0 ? heatBTU : Math.round(powerWatts * 3.412),
      powerSupplyCount: Number(formData.powerSupplyCount) || 0,
      powerSupplyType: formData.powerSupplyType.trim(),
      rackUnits: Number(formData.rackUnits) || 0,
      weight_kg: Number(formData.weight_kg) || 0,
      notes: formData.notes.trim(),
    });
  }

  function updateField(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field on change
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Name"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="e.g. AiFi Edge Server"
          error={errors.name}
          required
        />
        <Input
          label="Model"
          value={formData.model}
          onChange={(e) => updateField('model', e.target.value)}
          placeholder="e.g. Lenovo ThinkSystem SE350"
          error={errors.model}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Category"
          value={formData.category}
          onChange={(e) => updateField('category', e.target.value)}
          options={HARDWARE_CATEGORIES}
        />
        <Select
          label="Status"
          value={formData.status}
          onChange={(e) => updateField('status', e.target.value)}
          options={HARDWARE_STATUSES}
        />
      </div>

      {/* PoE toggle */}
      <div className="flex items-center gap-3 rounded-lg border border-aifi-gray bg-aifi-gray-50/50 px-4 py-3">
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={formData.poePowered}
            onChange={(e) => setFormData((prev) => ({ ...prev, poePowered: e.target.checked }))}
            className="peer sr-only"
          />
          <div className="h-5 w-9 rounded-full bg-aifi-gray after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-aifi-blue peer-checked:after:translate-x-full peer-focus:ring-2 peer-focus:ring-aifi-blue" />
        </label>
        <div>
          <span className="text-sm font-semibold text-aifi-black">PoE Powered</span>
          <p className="text-xs text-aifi-black-60">
            Device draws power via PoE from a switch — its wattage won't be counted separately in the mains power total
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label={formData.poePowered ? 'PoE Power Draw (Watts)' : 'Power Draw (Watts)'}
          type="number"
          min={0}
          value={formData.powerWatts}
          onChange={(e) => updateField('powerWatts', e.target.value)}
          placeholder="e.g. 300"
          error={errors.powerWatts}
          required
        />
        <Input
          label={formData.poePowered ? 'PoE Peak Power (Watts)' : 'Peak Power (Watts)'}
          type="number"
          min={0}
          value={formData.peakPowerWatts}
          onChange={(e) => updateField('peakPowerWatts', e.target.value)}
          placeholder="e.g. 450"
          error={errors.peakPowerWatts}
          required
        />
      </div>

      <div>
        <Input
          label="Heat Output (BTU/hr)"
          type="number"
          min={0}
          value={formData.heatOutputBTU}
          onChange={(e) => updateField('heatOutputBTU', e.target.value)}
          placeholder="0"
          error={errors.heatOutputBTU}
        />
        <p className="mt-1 text-xs text-aifi-black-60">
          Leave at 0 to auto-calculate from watts (watts x 3.412)
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Power Supply Count"
          type="number"
          min={0}
          value={formData.powerSupplyCount}
          onChange={(e) => updateField('powerSupplyCount', e.target.value)}
          placeholder="1"
          error={errors.powerSupplyCount}
        />
        <Input
          label="Power Supply Type"
          value={formData.powerSupplyType}
          onChange={(e) => updateField('powerSupplyType', e.target.value)}
          placeholder="e.g. IEC C14"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Rack Units (U)"
          type="number"
          min={0}
          step="any"
          value={formData.rackUnits}
          onChange={(e) => updateField('rackUnits', e.target.value)}
          placeholder="1"
          error={errors.rackUnits}
        />
        <Input
          label="Weight (kg)"
          type="number"
          min={0}
          step="any"
          value={formData.weight_kg}
          onChange={(e) => updateField('weight_kg', e.target.value)}
          placeholder="0"
          error={errors.weight_kg}
        />
      </div>

      <TextArea
        label="Notes"
        value={formData.notes}
        onChange={(e) => updateField('notes', e.target.value)}
        placeholder="Any additional notes or caveats..."
        rows={3}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {item ? 'Save Changes' : 'Add Hardware'}
        </Button>
      </div>
    </form>
  );
}
