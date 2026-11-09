package com.farmverse.equipment.dto.response;

import com.farmverse.equipment.enums.EquipmentCategory;
import com.farmverse.equipment.enums.EquipmentStatus;
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
public class EquipmentResponse {
    private Long id;
    private String name;
    private EquipmentCategory category;
    private String brand;
    private String model;
    private String registrationNumber;
    private String serialNumber;
    private LocalDate purchaseDate;
    private BigDecimal purchaseCost;
    private BigDecimal currentOperatingHours;
    private String fuelType;
    private BigDecimal fuelTankCapacity;
    private String equipmentCondition;
    private String assignedFarmId;
    private String organizationId;
    private String description;
    private String imageUrl;
    private EquipmentStatus status;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

