package com.farmverse.equipment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FuelConsumptionAnalyticsResponse {
    private BigDecimal totalFuelConsumedLitres;
    private BigDecimal totalFuelCost;
    private BigDecimal averageFuelCostPerLitre;
    private List<EquipmentFuelItem> equipmentConsumption;
    private List<MonthlyFuelTrendItem> monthlyTrends;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EquipmentFuelItem {
        private Long equipmentId;
        private String equipmentName;
        private String fuelType;
        private BigDecimal totalFuelConsumedLitres;
        private BigDecimal totalOperatingHours;
        private BigDecimal averageLitresPerHour;
        private BigDecimal totalFuelCost;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyFuelTrendItem {
        private String month;
        private BigDecimal litresConsumed;
        private BigDecimal cost;
    }
}

