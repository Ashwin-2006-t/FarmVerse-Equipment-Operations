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
public class MaintenanceCostAnalyticsResponse {
    private BigDecimal totalExpenditure;
    private BigDecimal labourCostTotal;
    private BigDecimal sparePartsCostTotal;
    private BigDecimal additionalCostTotal;
    private List<MaintenanceCostByTypeItem> expenditureByType;
    private List<MonthlyMaintenanceCostItem> monthlyExpenditureTrends;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MaintenanceCostByTypeItem {
        private String maintenanceType;
        private long incidentCount;
        private BigDecimal totalCost;
        private BigDecimal percentageOfTotal;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyMaintenanceCostItem {
        private String month;
        private long incidentCount;
        private BigDecimal labourCost;
        private BigDecimal sparePartsCost;
        private BigDecimal totalCost;
    }
}

