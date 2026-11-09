package com.farmverse.equipment.dto.request;

import com.farmverse.equipment.enums.EquipmentCategory;
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
public class EquipmentCreateRequest {

    @NotBlank(message = "Equipment name is required")
    @Size(max = 150, message = "Equipment name cannot exceed 150 characters")
    private String name;

    @NotNull(message = "Equipment category is required")
    private EquipmentCategory category;

    @NotBlank(message = "Brand is required")
    @Size(max = 100, message = "Brand cannot exceed 100 characters")
    private String brand;

    @NotBlank(message = "Model is required")
    @Size(max = 100, message = "Model cannot exceed 100 characters")
    private String model;

    @NotBlank(message = "Registration number is required")
    @Size(max = 50, message = "Registration number cannot exceed 50 characters")
    private String registrationNumber;

    @NotBlank(message = "Serial number is required")
    @Size(max = 100, message = "Serial number cannot exceed 100 characters")
    private String serialNumber;

    @NotNull(message = "Purchase date is required")
    private LocalDate purchaseDate;

    @NotNull(message = "Purchase cost is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Purchase cost must be non-negative")
    private BigDecimal purchaseCost;

    @NotNull(message = "Current operating hours is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Operating hours cannot be negative")
    private BigDecimal currentOperatingHours;

    @NotBlank(message = "Fuel type is required")
    @Size(max = 30, message = "Fuel type cannot exceed 30 characters")
    private String fuelType;

    @NotNull(message = "Fuel tank capacity is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Fuel tank capacity must be non-negative")
    private BigDecimal fuelTankCapacity;

    @NotBlank(message = "Equipment condition is required")
    @Size(max = 50, message = "Condition cannot exceed 50 characters")
    private String equipmentCondition;

    @NotBlank(message = "Assigned farm ID is required")
    private String assignedFarmId;

    @NotBlank(message = "Organization ID is required")
    private String organizationId;

    private String description;

    private String imageUrl;
}

