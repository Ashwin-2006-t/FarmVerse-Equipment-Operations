import api from './api';
import {
  DashboardSummary,
  FuelConsumptionAnalytics,
  MaintenanceCostAnalytics,
  NotificationItem,
  UtilizationAnalytics,
} from '../types/dashboard';
import { Equipment } from '../types/equipment';
import { EquipmentBooking } from '../types/booking';
import { MaintenanceRecord } from '../types/maintenance';

export interface AvailabilityPayload {
  totalEquipment: number;
  availableCount: number;
  bookedCount: number;
  inUseCount: number;
  underMaintenanceCount: number;
  outOfServiceCount: number;
  availableEquipment: Equipment[];
  activeBookings: EquipmentBooking[];
  activeMaintenance: MaintenanceRecord[];
}

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await api.get('/api/equipment/dashboard');
    return response.data;
  },

  getAvailability: async (): Promise<AvailabilityPayload> => {
    const response = await api.get('/api/equipment/availability');
    return response.data;
  },

  getUtilizationAnalytics: async (): Promise<UtilizationAnalytics> => {
    const response = await api.get('/api/equipment/analytics/utilization');
    return response.data;
  },

  getMaintenanceCostAnalytics: async (): Promise<MaintenanceCostAnalytics> => {
    const response = await api.get('/api/equipment/analytics/maintenance-cost');
    return response.data;
  },

  getFuelConsumptionAnalytics: async (): Promise<FuelConsumptionAnalytics> => {
    const response = await api.get('/api/equipment/analytics/fuel-consumption');
    return response.data;
  },

  // Notifications
  getNotifications: async (): Promise<NotificationItem[]> => {
    const response = await api.get('/api/equipment/notifications');
    return response.data;
  },

  getUnreadCount: async (): Promise<{ unreadCount: number }> => {
    const response = await api.get('/api/equipment/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id: number): Promise<void> => {
    await api.patch(`/api/equipment/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.post('/api/equipment/notifications/mark-all-read');
  },
};

