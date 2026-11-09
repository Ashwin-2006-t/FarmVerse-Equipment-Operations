package com.farmverse.equipment.dto.request;

import com.farmverse.equipment.enums.MaintenanceType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceScheduleRequest {

    @NotNull(message = "Equipment ID is required")
    private Long equipmentId;

    @NotBlank(message = "Service schedule name is required")
    @Size(max = 150)
    private String serviceName;

    @NotNull(message = "Maintenance type is required")
    private MaintenanceType maintenanceType;

    private Integer intervalDays;

    @DecimalMin("0.0")
    private BigDecimal intervalHours;

    private LocalDate lastServiceDate;

    private BigDecimal lastServiceHours;

    private LocalDate nextDueDate;

    private BigDecimal nextDueHours;

    private Integer advanceAlertDays;

    private BigDecimal advanceAlertHours;

    private Boolean isActive;

    private String remarks;
}

