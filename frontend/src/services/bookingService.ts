import api from './api';
import {
  BookingCreateRequest,
  BookingDecisionRequest,
  BookingStatus,
  EquipmentBooking,
} from '../types/booking';
import { PagedResponse } from '../types/equipment';

export const bookingService = {
  getAll: async (params?: {
    equipmentId?: number;
    status?: BookingStatus;
    userId?: string;
    farmId?: string;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<PagedResponse<EquipmentBooking>> => {
    const response = await api.get('/api/equipment/bookings', { params });
    return response.data;
  },

  getCalendar: async (start?: string, end?: string): Promise<EquipmentBooking[]> => {
    const response = await api.get('/api/equipment/bookings/calendar', {
      params: { start, end },
    });
    return response.data;
  },

  getById: async (id: number): Promise<EquipmentBooking> => {
    const response = await api.get(`/api/equipment/bookings/${id}`);
    return response.data;
  },

  create: async (data: BookingCreateRequest): Promise<EquipmentBooking> => {
    const response = await api.post('/api/equipment/bookings', data);
    return response.data;
  },

  approve: async (id: number, data?: BookingDecisionRequest): Promise<EquipmentBooking> => {
    const response = await api.patch(`/api/equipment/bookings/${id}/approve`, data || {});
    return response.data;
  },

  reject: async (id: number, data?: BookingDecisionRequest): Promise<EquipmentBooking> => {
    const response = await api.patch(`/api/equipment/bookings/${id}/reject`, data || {});
    return response.data;
  },

  cancel: async (id: number, data?: BookingDecisionRequest): Promise<EquipmentBooking> => {
    const response = await api.patch(`/api/equipment/bookings/${id}/cancel`, data || {});
    return response.data;
  },
};

