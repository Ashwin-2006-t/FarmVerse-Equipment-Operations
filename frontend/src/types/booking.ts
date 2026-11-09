export type BookingStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'IN_PROGRESS'
  | 'COMPLETED';

export interface EquipmentBooking {
  id: number;
  equipmentId: number;
  equipmentName: string;
  equipmentCategory: string;
  equipmentRegistrationNumber: string;
  equipmentImageUrl?: string;
  userId: string;
  userName: string;
  userRole: string;
  farmId: string;
  organizationId: string;
  startTime: string;
  endTime: string;
  purpose: string;
  workLocation: string;
  status: BookingStatus;
  approvalRemarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingCreateRequest {
  equipmentId: number;
  startTime: string;
  endTime: string;
  purpose: string;
  workLocation: string;
  farmId: string;
  organizationId?: string;
}

export interface BookingDecisionRequest {
  remarks?: string;
}

