package com.farmverse.equipment.dto.request;

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
public class UsageCreateRequest {

    @NotNull(message = "Equipment ID is required")
    private Long equipmentId;

    private Long bookingId;

    @NotBlank(message = "Farm ID is required")
    private String farmId;

    private String organizationId;

    @NotNull(message = "Usage date is required")
    private LocalDate usageDate;

    @NotNull(message = "Start operating hours is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Start operating hours must be non-negative")
    private BigDecimal startOperatingHours;

    @NotNull(message = "End operating hours is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "End operating hours must be non-negative")
    private BigDecimal endOperatingHours;

    @NotNull(message = "Fuel consumed is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Fuel consumed cannot be negative")
    private BigDecimal fuelConsumedLitres;

    @DecimalMin(value = "0.0", inclusive = true, message = "Fuel cost cannot be negative")
    private BigDecimal fuelCost;

    @NotBlank(message = "Operator details are required")
    @Size(max = 150)
    private String operatorDetails;

    @NotBlank(message = "Work description is required")
    private String workDescription;

    @DecimalMin(value = "0.0", inclusive = true, message = "Additional expenses cannot be negative")
    private BigDecimal additionalExpenses;

    private String remarks;
}

