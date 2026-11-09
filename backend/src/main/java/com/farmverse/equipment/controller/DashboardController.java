package com.farmverse.equipment.controller;

import com.farmverse.equipment.dto.response.*;
import com.farmverse.equipment.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
@Tag(name = "Dashboard & Analytics", description = "Endpoints for KPI cards, availability distribution, utilization rates and trends")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get comprehensive operations summary metrics for the main dashboard")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary() {
        return ResponseEntity.ok(dashboardService.getDashboardSummary());
    }

    @GetMapping("/availability")
    @Operation(summary = "Get machinery fleet availability status and timeline overview")
    public ResponseEntity<AvailabilityResponse> getEquipmentAvailability() {
        return ResponseEntity.ok(dashboardService.getEquipmentAvailability());
    }

    @GetMapping("/analytics/utilization")
    @Operation(summary = "Get equipment and category-wise utilization analytics and monthly trends")
    public ResponseEntity<UtilizationAnalyticsResponse> getUtilizationAnalytics() {
        return ResponseEntity.ok(dashboardService.getUtilizationAnalytics());
    }

    @GetMapping("/analytics/maintenance-cost")
    @Operation(summary = "Get maintenance expenditure breakdown by type and monthly financial trends")
    public ResponseEntity<MaintenanceCostAnalyticsResponse> getMaintenanceCostAnalytics() {
        return ResponseEntity.ok(dashboardService.getMaintenanceCostAnalytics());
    }

    @GetMapping("/analytics/fuel-consumption")
    @Operation(summary = "Get fuel consumption metrics, efficiency per operating hour and fuel cost trends")
    public ResponseEntity<FuelConsumptionAnalyticsResponse> getFuelConsumptionAnalytics() {
        return ResponseEntity.ok(dashboardService.getFuelConsumptionAnalytics());
    }
}

