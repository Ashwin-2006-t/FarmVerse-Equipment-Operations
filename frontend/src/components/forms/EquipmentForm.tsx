import React, { useState } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { Equipment, EquipmentCategory, EquipmentCreateRequest } from '../../types/equipment';

interface EquipmentFormProps {
  initialData?: Equipment | null;
  onSubmit: (data: EquipmentCreateRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const CATEGORIES: { value: EquipmentCategory; label: string }[] = [
  { value: 'TRACTORS', label: 'Tractor' },
  { value: 'HARVESTERS', label: 'Harvester' },
  { value: 'WATER_PUMPS', label: 'Water Pump' },
  { value: 'SPRAYERS', label: 'Sprayer' },
  { value: 'CULTIVATORS', label: 'Cultivator' },
  { value: 'SEED_DRILLS', label: 'Seed Drill' },
  { value: 'PLOUGHS', label: 'Plough' },
  { value: 'TILLERS', label: 'Tiller' },
  { value: 'TRAILERS', label: 'Trailer' },
  { value: 'OTHER', label: 'Other Machinery' },
];

const FUEL_TYPES = [
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'PETROL', label: 'Petrol' },
  { value: 'ELECTRIC', label: 'Electric' },
  { value: 'MANUAL', label: 'Manual' },
];

const CONDITIONS = [
  { value: 'EXCELLENT', label: 'Excellent' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'POOR', label: 'Poor' },
];

export default function EquipmentForm({ initialData, onSubmit, onCancel, loading }: EquipmentFormProps) {
  const [formData, setFormData] = useState<EquipmentCreateRequest>({
    name: initialData?.name || '',
    category: initialData?.category || 'TRACTORS',
    brand: initialData?.brand || '',
    model: initialData?.model || '',
    registrationNumber: initialData?.registrationNumber || '',
    serialNumber: initialData?.serialNumber || '',
    purchaseDate: initialData?.purchaseDate ? initialData.purchaseDate.split('T')[0] : new Date().toISOString().split('T')[0],
    purchaseCost: initialData?.purchaseCost || 0,
    currentOperatingHours: initialData?.currentOperatingHours || 0,
    fuelType: initialData?.fuelType || 'DIESEL',
    fuelTankCapacity: initialData?.fuelTankCapacity || 50,
    equipmentCondition: initialData?.equipmentCondition || 'GOOD',
    assignedFarmId: initialData?.assignedFarmId || 'FARM-001',
    description: initialData?.description || '',
    imageUrl: initialData?.imageUrl || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.brand.trim()) errs.brand = 'Brand is required';
    if (!formData.model.trim()) errs.model = 'Model is required';
    if (!formData.registrationNumber.trim()) errs.registrationNumber = 'Registration is required';
    if (!formData.serialNumber.trim()) errs.serialNumber = 'Serial number is required';
    if (formData.purchaseCost < 0) errs.purchaseCost = 'Cost must be positive';
    if (formData.currentOperatingHours < 0) errs.currentOperatingHours = 'Hours must be positive';
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
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Equipment Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          required
        />
        <Select
          label="Category"
          options={CATEGORIES}
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as EquipmentCategory })}
          required
        />
        <Input
          label="Brand"
          value={formData.brand}
          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
          error={errors.brand}
          required
        />
        <Input
          label="Model"
          value={formData.model}
          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
          error={errors.model}
          required
        />
        <Input
          label="Registration Number"
          value={formData.registrationNumber}
          onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
          error={errors.registrationNumber}
          required
        />
        <Input
          label="Serial Number"
          value={formData.serialNumber}
          onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
          error={errors.serialNumber}
          required
        />
        <Input
          label="Purchase Date"
          type="date"
          value={formData.purchaseDate}
          onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
          required
        />
        <Input
          label="Purchase Cost (ZAR)"
          type="number"
          value={formData.purchaseCost}
          onChange={(e) => setFormData({ ...formData, purchaseCost: parseFloat(e.target.value) || 0 })}
          error={errors.purchaseCost}
          required
        />
        <Input
          label="Initial Operating Hours"
          type="number"
          step="0.1"
          value={formData.currentOperatingHours}
          onChange={(e) => setFormData({ ...formData, currentOperatingHours: parseFloat(e.target.value) || 0 })}
          error={errors.currentOperatingHours}
          required
        />
        <Select
          label="Fuel Type"
          options={FUEL_TYPES}
          value={formData.fuelType}
          onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
          required
        />
        <Input
          label="Fuel Tank Capacity (L)"
          type="number"
          value={formData.fuelTankCapacity}
          onChange={(e) => setFormData({ ...formData, fuelTankCapacity: parseFloat(e.target.value) || 0 })}
          required
        />
        <Select
          label="Condition"
          options={CONDITIONS}
          value={formData.equipmentCondition}
          onChange={(e) => setFormData({ ...formData, equipmentCondition: e.target.value })}
          required
        />
        <Input
          label="Assigned Farm ID"
          value={formData.assignedFarmId}
          onChange={(e) => setFormData({ ...formData, assignedFarmId: e.target.value })}
          required
        />
        <Input
          label="Image URL"
          placeholder="https://..."
          value={formData.imageUrl || ''}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
        />
      </div>
      <Textarea
        label="Description"
        value={formData.description || ''}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
        <Button variant="outline" type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" loading={loading}>
          {initialData ? 'Update Equipment' : 'Register Equipment'}
        </Button>
      </div>
    </form>
  );
}

