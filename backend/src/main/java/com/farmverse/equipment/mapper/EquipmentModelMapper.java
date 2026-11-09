package com.farmverse.equipment.mapper;

import com.farmverse.equipment.dto.response.*;
import com.farmverse.equipment.entity.*;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class EquipmentModelMapper {

    public EquipmentResponse toEquipmentResponse(Equipment e) {
        if (e == null) return null;
        return EquipmentResponse.builder()
                .id(e.getId())
                .name(e.getName())
                .category(e.getCategory())
                .brand(e.getBrand())
                .model(e.getModel())
                .registrationNumber(e.getRegistrationNumber())
                .serialNumber(e.getSerialNumber())
                .purchaseDate(e.getPurchaseDate())
                .purchaseCost(e.getPurchaseCost())
                .currentOperatingHours(e.getCurrentOperatingHours())
                .fuelType(e.getFuelType())
                .fuelTankCapacity(e.getFuelTankCapacity())
                .equipmentCondition(e.getEquipmentCondition())
                .assignedFarmId(e.getAssignedFarmId())
                .organizationId(e.getOrganizationId())
                .description(e.getDescription())
                .imageUrl(e.getImageUrl())
                .status(e.getStatus())
                .isActive(e.getIsActive())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    public BookingResponse toBookingResponse(EquipmentBooking b) {
        if (b == null) return null;
        return BookingResponse.builder()
                .id(b.getId())
                .equipmentId(b.getEquipment() != null ? b.getEquipment().getId() : null)
                .equipmentName(b.getEquipment() != null ? b.getEquipment().getName() : null)
                .equipmentCategory(b.getEquipment() != null ? b.getEquipment().getCategory().name() : null)
                .equipmentRegistrationNumber(b.getEquipment() != null ? b.getEquipment().getRegistrationNumber() : null)
                .equipmentImageUrl(b.getEquipment() != null ? b.getEquipment().getImageUrl() : null)
                .userId(b.getUserId())
                .userName(b.getUserName())
                .userRole(b.getUserRole())
                .farmId(b.getFarmId())
                .organizationId(b.getOrganizationId())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .purpose(b.getPurpose())
                .workLocation(b.getWorkLocation())
                .status(b.getStatus())
                .approvalRemarks(b.getApprovalRemarks())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }

    public UsageResponse toUsageResponse(EquipmentUsage u) {
        if (u == null) return null;
        return UsageResponse.builder()
                .id(u.getId())
                .equipmentId(u.getEquipment() != null ? u.getEquipment().getId() : null)
                .equipmentName(u.getEquipment() != null ? u.getEquipment().getName() : null)
                .equipmentRegistrationNumber(u.getEquipment() != null ? u.getEquipment().getRegistrationNumber() : null)
                .bookingId(u.getBooking() != null ? u.getBooking().getId() : null)
                .farmId(u.getFarmId())
                .organizationId(u.getOrganizationId())
                .usageDate(u.getUsageDate())
                .startOperatingHours(u.getStartOperatingHours())
                .endOperatingHours(u.getEndOperatingHours())
                .totalOperatingHours(u.getTotalOperatingHours())
                .fuelConsumedLitres(u.getFuelConsumedLitres())
                .fuelCost(u.getFuelCost())
                .operatorDetails(u.getOperatorDetails())
                .workDescription(u.getWorkDescription())
                .additionalExpenses(u.getAdditionalExpenses())
                .totalUsageCost(u.getTotalUsageCost())
                .remarks(u.getRemarks())
                .createdAt(u.getCreatedAt())
                .updatedAt(u.getUpdatedAt())
                .build();
    }

    public MaintenanceResponse toMaintenanceResponse(MaintenanceRecord m) {
        if (m == null) return null;
        return MaintenanceResponse.builder()
                .id(m.getId())
                .equipmentId(m.getEquipment() != null ? m.getEquipment().getId() : null)
                .equipmentName(m.getEquipment() != null ? m.getEquipment().getName() : null)
                .equipmentRegistrationNumber(m.getEquipment() != null ? m.getEquipment().getRegistrationNumber() : null)
                .maintenanceType(m.getMaintenanceType())
                .description(m.getDescription())
                .serviceDate(m.getServiceDate())
                .serviceProvider(m.getServiceProvider())
                .technicianName(m.getTechnicianName())
                .labourCost(m.getLabourCost())
                .sparePartsCost(m.getSparePartsCost())
                .additionalCost(m.getAdditionalCost())
                .totalCost(m.getTotalCost())
                .previousOperatingHours(m.getPreviousOperatingHours())
                .nextServiceDate(m.getNextServiceDate())
                .nextServiceOperatingHourThreshold(m.getNextServiceOperatingHourThreshold())
                .status(m.getStatus())
                .remarks(m.getRemarks())
                .createdAt(m.getCreatedAt())
                .updatedAt(m.getUpdatedAt())
                .build();
    }

    public MaintenanceScheduleResponse toMaintenanceScheduleResponse(MaintenanceSchedule s) {
        if (s == null) return null;
        LocalDate today = LocalDate.now();
        boolean overdue = s.getNextDueDate() != null && s.getNextDueDate().isBefore(today);
        boolean upcoming = s.getNextDueDate() != null && !overdue && 
                s.getNextDueDate().isBefore(today.plusDays(s.getAdvanceAlertDays() != null ? s.getAdvanceAlertDays() : 7));

        if (s.getEquipment() != null && s.getNextDueHours() != null && s.getEquipment().getCurrentOperatingHours() != null) {
            if (s.getEquipment().getCurrentOperatingHours().compareTo(s.getNextDueHours()) >= 0) {
                overdue = true;
            } else if (s.getAdvanceAlertHours() != null && 
                    s.getEquipment().getCurrentOperatingHours().add(s.getAdvanceAlertHours()).compareTo(s.getNextDueHours()) >= 0) {
                upcoming = true;
            }
        }

        return MaintenanceScheduleResponse.builder()
                .id(s.getId())
                .equipmentId(s.getEquipment() != null ? s.getEquipment().getId() : null)
                .equipmentName(s.getEquipment() != null ? s.getEquipment().getName() : null)
                .equipmentRegistrationNumber(s.getEquipment() != null ? s.getEquipment().getRegistrationNumber() : null)
                .currentOperatingHours(s.getEquipment() != null ? s.getEquipment().getCurrentOperatingHours() : null)
                .serviceName(s.getServiceName())
                .maintenanceType(s.getMaintenanceType())
                .intervalDays(s.getIntervalDays())
                .intervalHours(s.getIntervalHours())
                .lastServiceDate(s.getLastServiceDate())
                .lastServiceHours(s.getLastServiceHours())
                .nextDueDate(s.getNextDueDate())
                .nextDueHours(s.getNextDueHours())
                .advanceAlertDays(s.getAdvanceAlertDays())
                .advanceAlertHours(s.getAdvanceAlertHours())
                .isUpcoming(upcoming)
                .isOverdue(overdue)
                .isActive(s.getIsActive())
                .remarks(s.getRemarks())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .build();
    }

    public NotificationResponse toNotificationResponse(EquipmentNotification n) {
        if (n == null) return null;
        return NotificationResponse.builder()
                .id(n.getId())
                .equipmentId(n.getEquipment() != null ? n.getEquipment().getId() : null)
                .equipmentName(n.getEquipment() != null ? n.getEquipment().getName() : null)
                .title(n.getTitle())
                .message(n.getMessage())
                .notificationType(n.getNotificationType())
                .severity(n.getSeverity())
                .isRead(n.getIsRead())
                .organizationId(n.getOrganizationId())
                .createdAt(n.getCreatedAt())
                .build();
    }
}

