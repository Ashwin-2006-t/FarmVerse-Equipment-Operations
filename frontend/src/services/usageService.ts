import api from './api';
import { EquipmentUsage, UsageCreateRequest } from '../types/usage';
import { PagedResponse } from '../types/equipment';

export const usageService = {
  getAll: async (params?: {
    equipmentId?: number;
    farmId?: string;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<PagedResponse<EquipmentUsage>> => {
    const response = await api.get('/api/equipment/usage', { params });
    return response.data;
  },

  getById: async (id: number): Promise<EquipmentUsage> => {
    const response = await api.get(`/api/equipment/usage/${id}`);
    return response.data;
  },

  create: async (data: UsageCreateRequest): Promise<EquipmentUsage> => {
    const response = await api.post('/api/equipment/usage', data);
    return response.data;
  },
};

