export type MaintenanceType =
  | 'REGULAR_SERVICING'
  | 'ENGINE_MAINTENANCE'
  | 'OIL_REPLACEMENT'
  | 'FILTER_REPLACEMENT'
  | 'TYRE_MAINTENANCE'
  | 'HYDRAULIC_MAINTENANCE'
  | 'ELECTRICAL_MAINTENANCE'
  | 'BREAKDOWN_REPAIR'
  | 'EMERGENCY_MAINTENANCE'
  | 'OTHER';

export type MaintenanceStatus =
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'OVERDUE'
  | 'CANCELLED';

export interface MaintenanceRecord {
  id: number;
  equipmentId: number;
  equipmentName: string;
  equipmentRegistrationNumber: string;
  maintenanceType: MaintenanceType;
  description: string;
  serviceDate: string;
  serviceProvider: string;
  technicianName: string;
  labourCost: number;
  sparePartsCost: number;
  additionalCost: number;
  totalCost: number;
  previousOperatingHours: number;
  nextServiceDate?: string;
  nextServiceOperatingHourThreshold?: number;
  status: MaintenanceStatus;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceCreateRequest {
  equipmentId: number;
  maintenanceType: MaintenanceType;
  description: string;
  serviceDate: string;
  serviceProvider: string;
  technicianName: string;
  labourCost: number;
  sparePartsCost: number;
  additionalCost: number;
  previousOperatingHours: number;
  nextServiceDate?: string;
  nextServiceOperatingHourThreshold?: number;
  status?: MaintenanceStatus;
  remarks?: string;
}

export interface MaintenanceUpdateRequest {
  maintenanceType: MaintenanceType;
  description: string;
  serviceDate: string;
  serviceProvider: string;
  technicianName: string;
  labourCost: number;
  sparePartsCost: number;
  additionalCost: number;
  previousOperatingHours: number;
  nextServiceDate?: string;
  nextServiceOperatingHourThreshold?: number;
  status: MaintenanceStatus;
  remarks?: string;
}

export interface MaintenanceSchedule {
  id: number;
  equipmentId: number;
  equipmentName: string;
  equipmentRegistrationNumber: string;
  currentOperatingHours: number;
  serviceName: string;
  maintenanceType: MaintenanceType;
  intervalDays?: number;
  intervalHours?: number;
  lastServiceDate?: string;
  lastServiceHours?: number;
  nextDueDate?: string;
  nextDueHours?: number;
  advanceAlertDays: number;
  advanceAlertHours: number;
  isUpcoming: boolean;
  isOverdue: boolean;
  isActive: boolean;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceScheduleRequest {
  equipmentId: number;
  serviceName: string;
  maintenanceType: MaintenanceType;
  intervalDays?: number;
  intervalHours?: number;
  lastServiceDate?: string;
  lastServiceHours?: number;
  nextDueDate?: string;
  nextDueHours?: number;
  advanceAlertDays?: number;
  advanceAlertHours?: number;
  isActive?: boolean;
  remarks?: string;
}

