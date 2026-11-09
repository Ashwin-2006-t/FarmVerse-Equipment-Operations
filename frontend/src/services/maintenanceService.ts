import api from './api';
import {
  MaintenanceCreateRequest,
  MaintenanceRecord,
  MaintenanceSchedule,
  MaintenanceScheduleRequest,
  MaintenanceStatus,
  MaintenanceType,
  MaintenanceUpdateRequest,
} from '../types/maintenance';
import { PagedResponse } from '../types/equipment';

export const maintenanceService = {
  getAll: async (params?: {
    equipmentId?: number;
    status?: MaintenanceStatus;
    type?: MaintenanceType;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<PagedResponse<MaintenanceRecord>> => {
    const response = await api.get('/api/equipment/maintenance', { params });
    return response.data;
  },

  getActive: async (): Promise<MaintenanceRecord[]> => {
    const response = await api.get('/api/equipment/maintenance/active');
    return response.data;
  },

  getById: async (id: number): Promise<MaintenanceRecord> => {
    const response = await api.get(`/api/equipment/maintenance/${id}`);
    return response.data;
  },

  create: async (data: MaintenanceCreateRequest): Promise<MaintenanceRecord> => {
    const response = await api.post('/api/equipment/maintenance', data);
    return response.data;
  },

  update: async (id: number, data: MaintenanceUpdateRequest): Promise<MaintenanceRecord> => {
    const response = await api.put(`/api/equipment/maintenance/${id}`, data);
    return response.data;
  },

  // Schedules
  getSchedules: async (equipmentId?: number): Promise<MaintenanceSchedule[]> => {
    const response = await api.get('/api/equipment/maintenance-schedules', {
      params: { equipmentId },
    });
    return response.data;
  },

  getUpcomingSchedules: async (): Promise<MaintenanceSchedule[]> => {
    const response = await api.get('/api/equipment/maintenance-schedules/upcoming');
    return response.data;
  },

  getOverdueSchedules: async (): Promise<MaintenanceSchedule[]> => {
    const response = await api.get('/api/equipment/maintenance-schedules/overdue');
    return response.data;
  },

  createSchedule: async (data: MaintenanceScheduleRequest): Promise<MaintenanceSchedule> => {
    const response = await api.post('/api/equipment/maintenance-schedules', data);
    return response.data;
  },

  updateSchedule: async (id: number, data: MaintenanceScheduleRequest): Promise<MaintenanceSchedule> => {
    const response = await api.put(`/api/equipment/maintenance-schedules/${id}`, data);
    return response.data;
  },

  evaluateAlerts: async (): Promise<string> => {
    const response = await api.post('/api/equipment/maintenance-schedules/evaluate');
    return response.data;
  },
};

