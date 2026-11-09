package com.farmverse.equipment.dto.response;

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
public class MaintenanceScheduleResponse {
    private Long id;
    private Long equipmentId;
    private String equipmentName;
    private String equipmentRegistrationNumber;
    private BigDecimal currentOperatingHours;
    private String serviceName;
    private MaintenanceType maintenanceType;
    private Integer intervalDays;
    private BigDecimal intervalHours;
    private LocalDate lastServiceDate;
    private BigDecimal lastServiceHours;
    private LocalDate nextDueDate;
    private BigDecimal nextDueHours;
    private Integer advanceAlertDays;
    private BigDecimal advanceAlertHours;
    private Boolean isUpcoming;
    private Boolean isOverdue;
    private Boolean isActive;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

