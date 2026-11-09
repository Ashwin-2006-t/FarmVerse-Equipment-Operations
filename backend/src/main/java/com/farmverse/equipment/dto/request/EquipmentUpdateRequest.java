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
public class EquipmentUpdateRequest {

    @NotBlank(message = "Equipment name is required")
    @Size(max = 150)
    private String name;

    @NotNull(message = "Equipment category is required")
    private EquipmentCategory category;

    @NotBlank(message = "Brand is required")
    @Size(max = 100)
    private String brand;

    @NotBlank(message = "Model is required")
    @Size(max = 100)
    private String model;

    @NotBlank(message = "Registration number is required")
    @Size(max = 50)
    private String registrationNumber;

    @NotBlank(message = "Serial number is required")
    @Size(max = 100)
    private String serialNumber;

    @NotNull(message = "Purchase date is required")
    private LocalDate purchaseDate;

    @NotNull(message = "Purchase cost is required")
    @DecimalMin("0.0")
    private BigDecimal purchaseCost;

    @NotNull(message = "Current operating hours is required")
    @DecimalMin("0.0")
    private BigDecimal currentOperatingHours;

    @NotBlank(message = "Fuel type is required")
    @Size(max = 30)
    private String fuelType;

    @NotNull(message = "Fuel tank capacity is required")
    @DecimalMin("0.0")
    private BigDecimal fuelTankCapacity;

    @NotBlank(message = "Equipment condition is required")
    @Size(max = 50)
    private String equipmentCondition;

    @NotBlank(message = "Assigned farm ID is required")
    private String assignedFarmId;

    private String description;

    private String imageUrl;
}

