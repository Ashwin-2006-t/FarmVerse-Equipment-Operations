package com.farmverse.equipment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {
    private long totalEquipment;
    private long availableEquipment;
    private long bookedEquipment;
    private long inUseEquipment;
    private long underMaintenanceEquipment;
    private long outOfServiceEquipment;
    private long inactiveEquipment;
    private long upcomingMaintenanceCount;
    private long pendingBookingCount;
    private BigDecimal totalOperatingHours;
    private BigDecimal totalFuelConsumptionLitres;
    private BigDecimal totalMaintenanceExpenditure;
    private BigDecimal totalUsageCost;
    private Map<String, Long> statusCounts;
    private List<BookingResponse> recentBookings;
    private List<MaintenanceResponse> activeMaintenance;
    private List<MaintenanceScheduleResponse> upcomingSchedules;
    private List<NotificationResponse> recentNotifications;
}

