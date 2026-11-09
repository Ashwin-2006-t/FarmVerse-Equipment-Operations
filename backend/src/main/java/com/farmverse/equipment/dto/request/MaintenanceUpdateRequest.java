package com.farmverse.equipment.dto.request;

import com.farmverse.equipment.enums.MaintenanceStatus;
import com.farmverse.equipment.enums.MaintenanceType;
import jakarta.validation.constraints.*;
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
public class MaintenanceUpdateRequest {

    @NotNull(message = "Maintenance type is required")
    private MaintenanceType maintenanceType;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Service date is required")
    private LocalDate serviceDate;

    @NotBlank(message = "Service provider is required")
    @Size(max = 150)
    private String serviceProvider;

    @NotBlank(message = "Technician name is required")
    @Size(max = 100)
    private String technicianName;

    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal labourCost;

    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal sparePartsCost;

    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal additionalCost;

    @NotNull(message = "Operating hours is required")
    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal previousOperatingHours;

    private LocalDate nextServiceDate;

    private BigDecimal nextServiceOperatingHourThreshold;

    @NotNull(message = "Status is required")
    private MaintenanceStatus status;

    private String remarks;
}

