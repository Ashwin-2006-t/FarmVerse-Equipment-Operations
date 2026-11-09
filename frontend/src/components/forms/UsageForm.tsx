import React, { useState } from 'react';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { UsageCreateRequest } from '../../types/usage';

interface UsageFormProps {
  equipmentId?: number;
  equipmentName?: string;
  currentHours?: number;
  equipmentList?: { id: number; name: string; currentOperatingHours: number }[];
  bookingId?: number;
  onSubmit: (data: UsageCreateRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function UsageForm({
  equipmentId,
  equipmentName,
  currentHours = 0,
  equipmentList = [],
  bookingId,
  onSubmit,
  onCancel,
  loading,
}: UsageFormProps) {
  const [formData, setFormData] = useState<UsageCreateRequest>({
    equipmentId: equipmentId || (equipmentList[0]?.id ?? 0),
    bookingId,
    farmId: 'FARM-001',
    usageDate: new Date().toISOString().split('T')[0],
    startOperatingHours: currentHours,
    endOperatingHours: currentHours + 4,
    fuelConsumedLitres: 15,
    fuelCost: 350,
    operatorDetails: 'Jan Van Der Merwe (Cert #OP-8821)',
    workDescription: 'Plowing and soil preparation in Field 4',
    additionalExpenses: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.equipmentId) errs.equipmentId = 'Equipment is required';
    if (formData.endOperatingHours < formData.startOperatingHours) {
      errs.endOperatingHours = 'End hours cannot be less than start hours';
    }
    if (formData.fuelConsumedLitres < 0) errs.fuelConsumedLitres = 'Fuel cannot be negative';
    if (!formData.operatorDetails.trim()) errs.operatorDetails = 'Operator details required';
    if (!formData.workDescription.trim()) errs.workDescription = 'Work description required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const calculatedHours = Math.max(0, formData.endOperatingHours - formData.startOperatingHours);

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
            onChange={(e) => {
              const id = Number(e.target.value);
              const found = equipmentList.find((x) => x.id === id);
              setFormData({
                ...formData,
                equipmentId: id,
                startOperatingHours: found?.currentOperatingHours ?? 0,
                endOperatingHours: (found?.currentOperatingHours ?? 0) + 4,
              });
            }}
          >
            {equipmentList.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.name} (Current: {eq.currentOperatingHours}h)
              </option>
            ))}
          </select>
        </div>
      )}

      {equipmentName && (
        <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          Recording log for: <strong>{equipmentName}</strong>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Usage Date"
          type="date"
          value={formData.usageDate}
          onChange={(e) => setFormData({ ...formData, usageDate: e.target.value })}
          required
        />
        <Input
          label="Farm ID"
          value={formData.farmId}
          onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
          required
        />
        <Input
          label="Start Operating Hours"
          type="number"
          step="0.1"
          value={formData.startOperatingHours}
          onChange={(e) => setFormData({ ...formData, startOperatingHours: parseFloat(e.target.value) || 0 })}
          required
        />
        <Input
          label="End Operating Hours"
          type="number"
          step="0.1"
          value={formData.endOperatingHours}
          onChange={(e) => setFormData({ ...formData, endOperatingHours: parseFloat(e.target.value) || 0 })}
          error={errors.endOperatingHours}
          required
        />
      </div>

      <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
        Total Operating Hours: <strong>{calculatedHours.toFixed(1)} hrs</strong>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Fuel Consumed (Litres)"
          type="number"
          step="0.1"
          value={formData.fuelConsumedLitres}
          onChange={(e) => setFormData({ ...formData, fuelConsumedLitres: parseFloat(e.target.value) || 0 })}
          error={errors.fuelConsumedLitres}
          required
        />
        <Input
          label="Fuel Cost (ZAR)"
          type="number"
          step="0.01"
          value={formData.fuelCost || 0}
          onChange={(e) => setFormData({ ...formData, fuelCost: parseFloat(e.target.value) || 0 })}
        />
      </div>

      <Input
        label="Operator Details"
        placeholder="e.g. Sipho Ndlovu (Cert #AG-4491)"
        value={formData.operatorDetails}
        onChange={(e) => setFormData({ ...formData, operatorDetails: e.target.value })}
        error={errors.operatorDetails}
        required
      />

      <Input
        label="Additional Expenses (ZAR)"
        type="number"
        step="0.01"
        value={formData.additionalExpenses || 0}
        onChange={(e) => setFormData({ ...formData, additionalExpenses: parseFloat(e.target.value) || 0 })}
      />

      <Textarea
        label="Work Description"
        placeholder="Specific fields worked, task performed, implement attached…"
        value={formData.workDescription}
        onChange={(e) => setFormData({ ...formData, workDescription: e.target.value })}
        error={errors.workDescription}
        required
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
        <Button variant="outline" type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" loading={loading}>
          Record Usage Log
        </Button>
      </div>
    </form>
  );
}

