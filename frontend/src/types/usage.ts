export interface EquipmentUsage {
  id: number;
  equipmentId: number;
  equipmentName: string;
  equipmentRegistrationNumber: string;
  bookingId?: number;
  farmId: string;
  organizationId: string;
  usageDate: string;
  startOperatingHours: number;
  endOperatingHours: number;
  totalOperatingHours: number;
  fuelConsumedLitres: number;
  fuelCost: number;
  operatorDetails: string;
  workDescription: string;
  additionalExpenses: number;
  totalUsageCost: number;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsageCreateRequest {
  equipmentId: number;
  bookingId?: number;
  farmId: string;
  organizationId?: string;
  usageDate: string;
  startOperatingHours: number;
  endOperatingHours: number;
  fuelConsumedLitres: number;
  fuelCost?: number;
  operatorDetails: string;
  workDescription: string;
  additionalExpenses?: number;
  remarks?: string;
}

