package com.farmverse.equipment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityResponse {
    private long totalEquipment;
    private long availableCount;
    private long bookedCount;
    private long inUseCount;
    private long underMaintenanceCount;
    private long outOfServiceCount;
    private List<EquipmentResponse> availableEquipment;
    private List<BookingResponse> activeBookings;
    private List<MaintenanceResponse> activeMaintenance;
}

