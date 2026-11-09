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
public class UtilizationAnalyticsResponse {
    private BigDecimal overallUtilizationPercentage;
    private BigDecimal totalOperatingHours;
    private BigDecimal standardCapacityOperatingHours;
    private List<EquipmentUtilizationItem> equipmentUtilization;
    private List<CategoryUtilizationItem> categoryUtilization;
    private List<MonthlyTrendItem> monthlyUsageTrends;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EquipmentUtilizationItem {
        private Long equipmentId;
        private String equipmentName;
        private String category;
        private BigDecimal operatingHours;
        private BigDecimal utilizationPercentage;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryUtilizationItem {
        private String category;
        private long equipmentCount;
        private BigDecimal totalHours;
        private BigDecimal averageHoursPerMachine;
        private BigDecimal utilizationPercentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyTrendItem {
        private String month;
        private BigDecimal operatingHours;
        private BigDecimal fuelLitres;
        private BigDecimal usageCost;
    }
}

