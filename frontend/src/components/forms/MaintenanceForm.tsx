import React, { useState } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { MaintenanceCreateRequest, MaintenanceRecord, MaintenanceType } from '../../types/maintenance';

interface MaintenanceFormProps {
  equipmentId?: number;
  equipmentName?: string;
  currentHours?: number;
  equipmentList?: { id: number; name: string; currentOperatingHours: number }[];
  initialData?: MaintenanceRecord | null;
  onSubmit: (data: MaintenanceCreateRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const MAINTENANCE_TYPES: { value: MaintenanceType; label: string }[] = [
  { value: 'REGULAR_SERVICING', label: 'Regular Servicing' },
  { value: 'ENGINE_MAINTENANCE', label: 'Engine Maintenance' },
  { value: 'OIL_REPLACEMENT', label: 'Oil Replacement' },
  { value: 'FILTER_REPLACEMENT', label: 'Filter Replacement' },
  { value: 'TYRE_MAINTENANCE', label: 'Tyre Maintenance' },
  { value: 'HYDRAULIC_MAINTENANCE', label: 'Hydraulic Maintenance' },
  { value: 'ELECTRICAL_MAINTENANCE', label: 'Electrical Maintenance' },
  { value: 'BREAKDOWN_REPAIR', label: 'Breakdown Repair' },
  { value: 'EMERGENCY_MAINTENANCE', label: 'Emergency Maintenance' },
  { value: 'OTHER', label: 'Other' },
];

export default function MaintenanceForm({
  equipmentId,
  equipmentName,
  currentHours = 0,
  equipmentList = [],
  initialData,
  onSubmit,
  onCancel,
  loading,
}: MaintenanceFormProps) {
  const [formData, setFormData] = useState<MaintenanceCreateRequest>({
    equipmentId: initialData?.equipmentId || equipmentId || (equipmentList[0]?.id ?? 0),
    maintenanceType: initialData?.maintenanceType || 'REGULAR_SERVICING',
    description: initialData?.description || '',
    serviceDate: initialData?.serviceDate ? initialData.serviceDate.split('T')[0] : new Date().toISOString().split('T')[0],
    serviceProvider: initialData?.serviceProvider || 'AgriMech Services Ltd',
    technicianName: initialData?.technicianName || 'David Miller',
    labourCost: initialData?.labourCost || 1200,
    sparePartsCost: initialData?.sparePartsCost || 850,
    additionalCost: initialData?.additionalCost || 0,
    previousOperatingHours: initialData?.previousOperatingHours || currentHours,
    nextServiceDate: initialData?.nextServiceDate ? initialData.nextServiceDate.split('T')[0] : '',
    nextServiceOperatingHourThreshold: initialData?.nextServiceOperatingHourThreshold || currentHours + 250,
    status: initialData?.status || 'SCHEDULED',
    remarks: initialData?.remarks || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.equipmentId) errs.equipmentId = 'Equipment is required';
    if (!formData.description.trim()) errs.description = 'Description is required';
    if (!formData.serviceProvider.trim()) errs.serviceProvider = 'Provider is required';
    if (!formData.technicianName.trim()) errs.technicianName = 'Technician is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const totalCost = (formData.labourCost || 0) + (formData.sparePartsCost || 0) + (formData.additionalCost || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!equipmentId && equipmentList.length > 0 && !initialData && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Equipment <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-green-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            value={formData.equipmentId}
            onChange={(e) => {
              const id = Number(e.target.value);
              const found = equipmentList.find((x) => x.id === id);
              setFormData({
                ...formData,
                equipmentId: id,
                previousOperatingHours: found?.currentOperatingHours ?? 0,
                nextServiceOperatingHourThreshold: (found?.currentOperatingHours ?? 0) + 250,
              });
            }}
          >
            {equipmentList.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.name} ({eq.currentOperatingHours} hrs)
              </option>
            ))}
          </select>
        </div>
      )}

      {equipmentName && (
        <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          Equipment: <strong>{equipmentName}</strong>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Maintenance Type"
          options={MAINTENANCE_TYPES}
          value={formData.maintenanceType}
          onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value as MaintenanceType })}
          required
        />
        <Input
          label="Service Date"
          type="date"
          value={formData.serviceDate}
          onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
          required
        />
        <Input
          label="Service Provider"
          value={formData.serviceProvider}
          onChange={(e) => setFormData({ ...formData, serviceProvider: e.target.value })}
          error={errors.serviceProvider}
          required
        />
        <Input
          label="Technician Name"
          value={formData.technicianName}
          onChange={(e) => setFormData({ ...formData, technicianName: e.target.value })}
          error={errors.technicianName}
          required
        />
        <Input
          label="Labour Cost (ZAR)"
          type="number"
          value={formData.labourCost}
          onChange={(e) => setFormData({ ...formData, labourCost: parseFloat(e.target.value) || 0 })}
          required
        />
        <Input
          label="Spare Parts Cost (ZAR)"
          type="number"
          value={formData.sparePartsCost}
          onChange={(e) => setFormData({ ...formData, sparePartsCost: parseFloat(e.target.value) || 0 })}
          required
        />
        <Input
          label="Additional Cost (ZAR)"
          type="number"
          value={formData.additionalCost}
          onChange={(e) => setFormData({ ...formData, additionalCost: parseFloat(e.target.value) || 0 })}
        />
        <Input
          label="Operating Hours at Service"
          type="number"
          step="0.1"
          value={formData.previousOperatingHours}
          onChange={(e) => setFormData({ ...formData, previousOperatingHours: parseFloat(e.target.value) || 0 })}
          required
        />
        <Input
          label="Next Service Date"
          type="date"
          value={formData.nextServiceDate || ''}
          onChange={(e) => setFormData({ ...formData, nextServiceDate: e.target.value })}
        />
        <Input
          label="Next Service Hours Threshold"
          type="number"
          step="0.1"
          value={formData.nextServiceOperatingHourThreshold || 0}
          onChange={(e) =>
            setFormData({ ...formData, nextServiceOperatingHourThreshold: parseFloat(e.target.value) || 0 })
          }
        />
      </div>

      <div className="rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
        Estimated Total Maintenance Cost: R {totalCost.toFixed(2)}
      </div>

      <Textarea
        label="Description of Work Performed"
        placeholder="Filter replaced, hydraulic lines inspected, oil changed with 15W-40…"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        error={errors.description}
        required
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
        <Button variant="outline" type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" loading={loading}>
          {initialData ? 'Update Record' : 'Save Maintenance Record'}
        </Button>
      </div>
    </form>
  );
}

