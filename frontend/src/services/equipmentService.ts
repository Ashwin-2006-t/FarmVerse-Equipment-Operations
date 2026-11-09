import api from './api';
import {
  Equipment,
  EquipmentCategory,
  EquipmentCreateRequest,
  EquipmentStatus,
  EquipmentUpdateRequest,
  PagedResponse,
} from '../types/equipment';
import { EquipmentBooking } from '../types/booking';
import { EquipmentUsage } from '../types/usage';
import { MaintenanceRecord } from '../types/maintenance';

export const equipmentService = {
  getAll: async (params?: {
    search?: string;
    category?: EquipmentCategory;
    status?: EquipmentStatus;
    farmId?: string;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<PagedResponse<Equipment>> => {
    const response = await api.get('/api/equipment', { params });
    return response.data;
  },

  getAllActive: async (): Promise<Equipment[]> => {
    const response = await api.get('/api/equipment/active');
    return response.data;
  },

  getById: async (id: number): Promise<Equipment> => {
    const response = await api.get(`/api/equipment/${id}`);
    return response.data;
  },

  create: async (data: EquipmentCreateRequest): Promise<Equipment> => {
    const response = await api.post('/api/equipment', data);
    return response.data;
  },

  update: async (id: number, data: EquipmentUpdateRequest): Promise<Equipment> => {
    const response = await api.put(`/api/equipment/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: number, status: EquipmentStatus, remarks?: string): Promise<Equipment> => {
    const response = await api.patch(`/api/equipment/${id}/status`, { status, remarks });
    return response.data;
  },

  deleteOrDeactivate: async (id: number): Promise<void> => {
    await api.delete(`/api/equipment/${id}`);
  },

  getBookings: async (id: number): Promise<EquipmentBooking[]> => {
    const response = await api.get(`/api/equipment/${id}/bookings`);
    return response.data;
  },

  getUsage: async (id: number): Promise<EquipmentUsage[]> => {
    const response = await api.get(`/api/equipment/${id}/usage`);
    return response.data;
  },

  getMaintenance: async (id: number): Promise<MaintenanceRecord[]> => {
    const response = await api.get(`/api/equipment/${id}/maintenance`);
    return response.data;
  },
};

