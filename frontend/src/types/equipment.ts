export type EquipmentCategory =
  | 'TRACTORS'
  | 'HARVESTERS'
  | 'WATER_PUMPS'
  | 'SPRAYERS'
  | 'CULTIVATORS'
  | 'SEED_DRILLS'
  | 'PLOUGHS'
  | 'TILLERS'
  | 'TRAILERS'
  | 'OTHER';

export type EquipmentStatus =
  | 'AVAILABLE'
  | 'BOOKED'
  | 'IN_USE'
  | 'UNDER_MAINTENANCE'
  | 'OUT_OF_SERVICE'
  | 'INACTIVE';

export interface Equipment {
  id: number;
  name: string;
  category: EquipmentCategory;
  brand: string;
  model: string;
  registrationNumber: string;
  serialNumber: string;
  purchaseDate: string;
  purchaseCost: number;
  currentOperatingHours: number;
  fuelType: string;
  fuelTankCapacity: number;
  equipmentCondition: string;
  assignedFarmId: string;
  organizationId: string;
  description?: string;
  imageUrl?: string;
  status: EquipmentStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentCreateRequest {
  name: string;
  category: EquipmentCategory;
  brand: string;
  model: string;
  registrationNumber: string;
  serialNumber: string;
  purchaseDate: string;
  purchaseCost: number;
  currentOperatingHours: number;
  fuelType: string;
  fuelTankCapacity: number;
  equipmentCondition: string;
  assignedFarmId: string;
  organizationId?: string;
  description?: string;
  imageUrl?: string;
}

export interface EquipmentUpdateRequest {
  name: string;
  category: EquipmentCategory;
  brand: string;
  model: string;
  registrationNumber: string;
  serialNumber: string;
  purchaseDate: string;
  purchaseCost: number;
  currentOperatingHours: number;
  fuelType: string;
  fuelTankCapacity: number;
  equipmentCondition: string;
  assignedFarmId: string;
  description?: string;
  imageUrl?: string;
}

export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

