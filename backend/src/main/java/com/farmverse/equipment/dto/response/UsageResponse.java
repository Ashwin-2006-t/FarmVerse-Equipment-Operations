package com.farmverse.equipment.dto.response;

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
public class UsageResponse {
    private Long id;
    private Long equipmentId;
    private String equipmentName;
    private String equipmentRegistrationNumber;
    private Long bookingId;
    private String farmId;
    private String organizationId;
    private LocalDate usageDate;
    private BigDecimal startOperatingHours;
    private BigDecimal endOperatingHours;
    private BigDecimal totalOperatingHours;
    private BigDecimal fuelConsumedLitres;
    private BigDecimal fuelCost;
    private String operatorDetails;
    private String workDescription;
    private BigDecimal additionalExpenses;
    private BigDecimal totalUsageCost;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

