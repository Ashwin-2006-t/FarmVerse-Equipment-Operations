import React, { useState } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { MaintenanceScheduleRequest, MaintenanceType } from '../../types/maintenance';

interface MaintenanceScheduleFormProps {
  equipmentId?: number;
  equipmentName?: string;
  equipmentList?: { id: number; name: string }[];
  onSubmit: (data: MaintenanceScheduleRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const MAINTENANCE_TYPES: { value: MaintenanceType; label: string }[] = [
  { value: 'REGULAR_SERVICING', label: 'Regular Servicing' },
  { value: 'ENGINE_MAINTENANCE', label: 'Engine Maintenance' },
  { value: 'OIL_REPLACEMENT', label: 'Oil Replacement' },
  { value: 'FILTER_REPLACEMENT', label: 'Filter Replacement' },
  { value: 'HYDRAULIC_MAINTENANCE', label: 'Hydraulic Maintenance' },
  { value: 'TYRE_MAINTENANCE', label: 'Tyre Maintenance' },
  { value: 'ELECTRICAL_MAINTENANCE', label: 'Electrical Maintenance' },
  { value: 'OTHER', label: 'Other' },
];

export default function MaintenanceScheduleForm({
  equipmentId,
  equipmentName,
  equipmentList = [],
  onSubmit,
  onCancel,
  loading,
}: MaintenanceScheduleFormProps) {
  const [formData, setFormData] = useState<MaintenanceScheduleRequest>({
    equipmentId: equipmentId || (equipmentList[0]?.id ?? 0),
    serviceName: '250-Hour Standard Service',
    maintenanceType: 'REGULAR_SERVICING',
    intervalDays: 90,
    intervalHours: 250,
    advanceAlertDays: 14,
    advanceAlertHours: 25,
    remarks: 'Routine fluid check, filter swaps, and grease points',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.equipmentId) errs.equipmentId = 'Equipment is required';
    if (!formData.serviceName.trim()) errs.serviceName = 'Service name is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!equipmentId && equipmentList.length > 0 && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Equipment <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-green-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            value={formData.equipmentId}
            onChange={(e) => setFormData({ ...formData, equipmentId: Number(e.target.value) })}
          >
            {equipmentList.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {equipmentName && (
        <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          Target Machine: <strong>{equipmentName}</strong>
        </div>
      )}

      <Input
        label="Service Program Name"
        value={formData.serviceName}
        onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
        error={errors.serviceName}
        required
      />

      <Select
        label="Maintenance Type"
        options={MAINTENANCE_TYPES}
        value={formData.maintenanceType}
        onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value as MaintenanceType })}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Interval (Days)"
          type="number"
          value={formData.intervalDays || ''}
          onChange={(e) => setFormData({ ...formData, intervalDays: parseInt(e.target.value) || undefined })}
          hint="e.g. Every 90 days"
        />
        <Input
          label="Interval (Operating Hours)"
          type="number"
          value={formData.intervalHours || ''}
          onChange={(e) => setFormData({ ...formData, intervalHours: parseInt(e.target.value) || undefined })}
          hint="e.g. Every 250 hours"
        />
        <Input
          label="Advance Alert (Days)"
          type="number"
          value={formData.advanceAlertDays || 14}
          onChange={(e) => setFormData({ ...formData, advanceAlertDays: parseInt(e.target.value) || 0 })}
          hint="Notify this many days ahead"
        />
        <Input
          label="Advance Alert (Hours)"
          type="number"
          value={formData.advanceAlertHours || 25}
          onChange={(e) => setFormData({ ...formData, advanceAlertHours: parseInt(e.target.value) || 0 })}
          hint="Notify this many hours ahead"
        />
      </div>

      <Textarea
        label="Schedule Remarks"
        value={formData.remarks || ''}
        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
        <Button variant="outline" type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" loading={loading}>
          Create Schedule Rule
        </Button>
      </div>
    </form>
  );
}

