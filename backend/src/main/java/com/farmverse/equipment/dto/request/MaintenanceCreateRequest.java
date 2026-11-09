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
public class MaintenanceCreateRequest {

    @NotNull(message = "Equipment ID is required")
    private Long equipmentId;

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

    @DecimalMin(value = "0.0", inclusive = true, message = "Labour cost cannot be negative")
    private BigDecimal labourCost;

    @DecimalMin(value = "0.0", inclusive = true, message = "Spare parts cost cannot be negative")
    private BigDecimal sparePartsCost;

    @DecimalMin(value = "0.0", inclusive = true, message = "Additional cost cannot be negative")
    private BigDecimal additionalCost;

    @NotNull(message = "Operating hours at time of service is required")
    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal previousOperatingHours;

    private LocalDate nextServiceDate;

    private BigDecimal nextServiceOperatingHourThreshold;

    private MaintenanceStatus status;

    private String remarks;
}

