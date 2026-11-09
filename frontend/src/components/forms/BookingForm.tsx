import React, { useState } from 'react';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { BookingCreateRequest } from '../../types/booking';

interface BookingFormProps {
  equipmentId?: number;
  equipmentName?: string;
  equipmentList?: { id: number; name: string; registrationNumber: string }[];
  onSubmit: (data: BookingCreateRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function BookingForm({
  equipmentId,
  equipmentName,
  equipmentList = [],
  onSubmit,
  onCancel,
  loading,
}: BookingFormProps) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(8, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(17, 0, 0, 0);

  const toLocalISO = (d: Date) => d.toISOString().slice(0, 16);

  const [formData, setFormData] = useState<BookingCreateRequest>({
    equipmentId: equipmentId || (equipmentList[0]?.id ?? 0),
    startTime: toLocalISO(tomorrow),
    endTime: toLocalISO(tomorrowEnd),
    purpose: '',
    workLocation: 'Field 4 - North Sector',
    farmId: 'FARM-001',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.equipmentId) errs.equipmentId = 'Please select equipment';
    if (!formData.purpose.trim()) errs.purpose = 'Purpose is required';
    if (!formData.workLocation.trim()) errs.workLocation = 'Location is required';
    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      errs.endTime = 'End time must be after start time';
    }
    if (new Date(formData.startTime) < new Date()) {
      errs.startTime = 'Start time cannot be in the past';
    }
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
                {eq.name} ({eq.registrationNumber})
              </option>
            ))}
          </select>
        </div>
      )}

      {equipmentName && (
        <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          Booking machine: <strong>{equipmentName}</strong>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Start Date & Time"
          type="datetime-local"
          value={formData.startTime}
          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          error={errors.startTime}
          required
        />
        <Input
          label="End Date & Time"
          type="datetime-local"
          value={formData.endTime}
          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
          error={errors.endTime}
          required
        />
      </div>

      <Input
        label="Work Location"
        value={formData.workLocation}
        onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
        error={errors.workLocation}
        required
      />

      <Input
        label="Farm ID"
        value={formData.farmId}
        onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
        required
      />

      <Textarea
        label="Purpose of Booking"
        placeholder="e.g. Autumn plowing of North field, section 3…"
        value={formData.purpose}
        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
        error={errors.purpose}
        required
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
        <Button variant="outline" type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" loading={loading}>
          Submit Booking Request
        </Button>
      </div>
    </form>
  );
}

