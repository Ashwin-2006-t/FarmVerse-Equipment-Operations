import { EquipmentBooking } from './booking';
import { MaintenanceRecord, MaintenanceSchedule } from './maintenance';

export interface NotificationItem {
  id: number;
  equipmentId?: number;
  equipmentName?: string;
  title: string;
  message: string;
  notificationType: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  isRead: boolean;
  organizationId: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalEquipment: number;
  availableEquipment: number;
  bookedEquipment: number;
  inUseEquipment: number;
  underMaintenanceEquipment: number;
  outOfServiceEquipment: number;
  inactiveEquipment: number;
  upcomingMaintenanceCount: number;
  pendingBookingCount: number;
  totalOperatingHours: number;
  totalFuelConsumptionLitres: number;
  totalMaintenanceExpenditure: number;
  totalUsageCost: number;
  statusCounts: Record<string, number>;
  recentBookings: EquipmentBooking[];
  activeMaintenance: MaintenanceRecord[];
  upcomingSchedules: MaintenanceSchedule[];
  recentNotifications: NotificationItem[];
}

export interface EquipmentUtilizationItem {
  equipmentId: number;
  equipmentName: string;
  category: string;
  operatingHours: number;
  utilizationPercentage: number;
  status: string;
}

export interface CategoryUtilizationItem {
  category: string;
  equipmentCount: number;
  totalHours: number;
  averageHoursPerMachine: number;
  utilizationPercentage: number;
}

export interface MonthlyTrendItem {
  month: string;
  operatingHours: number;
  fuelLitres: number;
  usageCost: number;
}

export interface UtilizationAnalytics {
  overallUtilizationPercentage: number;
  totalOperatingHours: number;
  standardCapacityOperatingHours: number;
  equipmentUtilization: EquipmentUtilizationItem[];
  categoryUtilization: CategoryUtilizationItem[];
  monthlyUsageTrends: MonthlyTrendItem[];
}

export interface MaintenanceCostByTypeItem {
  maintenanceType: string;
  incidentCount: number;
  totalCost: number;
  percentageOfTotal: number;
}

export interface MonthlyMaintenanceCostItem {
  month: string;
  incidentCount: number;
  labourCost: number;
  sparePartsCost: number;
  totalCost: number;
}

export interface MaintenanceCostAnalytics {
  totalExpenditure: number;
  labourCostTotal: number;
  sparePartsCostTotal: number;
  additionalCostTotal: number;
  expenditureByType: MaintenanceCostByTypeItem[];
  monthlyExpenditureTrends: MonthlyMaintenanceCostItem[];
}

export interface EquipmentFuelItem {
  equipmentId: number;
  equipmentName: string;
  fuelType: string;
  totalFuelConsumedLitres: number;
  totalOperatingHours: number;
  averageLitresPerHour: number;
  totalFuelCost: number;
}

export interface MonthlyFuelTrendItem {
  month: string;
  litresConsumed: number;
  cost: number;
}

export interface FuelConsumptionAnalytics {
  totalFuelConsumedLitres: number;
  totalFuelCost: number;
  averageFuelCostPerLitre: number;
  equipmentConsumption: EquipmentFuelItem[];
  monthlyTrends: MonthlyFuelTrendItem[];
}

