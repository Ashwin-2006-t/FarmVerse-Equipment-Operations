package com.farmverse.equipment.dto.response;

import com.farmverse.equipment.enums.MaintenanceStatus;
import com.farmverse.equipment.enums.MaintenanceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceResponse {
    private Long id;
    private Long equipmentId;
    private String equipmentName;
    private String equipmentRegistrationNumber;
    private MaintenanceType maintenanceType;
    private String description;
    private LocalDate serviceDate;
    private String serviceProvider;
    private String technicianName;
    private BigDecimal labourCost;
    private BigDecimal sparePartsCost;
    private BigDecimal additionalCost;
    private BigDecimal totalCost;
    private BigDecimal previousOperatingHours;
    private LocalDate nextServiceDate;
    private BigDecimal nextServiceOperatingHourThreshold;
    private MaintenanceStatus status;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

