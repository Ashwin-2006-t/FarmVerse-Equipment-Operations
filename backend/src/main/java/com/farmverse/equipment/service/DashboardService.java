package com.farmverse.equipment.service;

import com.farmverse.equipment.dto.response.*;

public interface DashboardService {

    DashboardSummaryResponse getDashboardSummary();

    AvailabilityResponse getEquipmentAvailability();

    UtilizationAnalyticsResponse getUtilizationAnalytics();

    MaintenanceCostAnalyticsResponse getMaintenanceCostAnalytics();

    FuelConsumptionAnalyticsResponse getFuelConsumptionAnalytics();
}

