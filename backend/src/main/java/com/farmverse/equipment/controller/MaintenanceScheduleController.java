package com.farmverse.equipment.controller;

import com.farmverse.equipment.dto.request.MaintenanceScheduleRequest;
import com.farmverse.equipment.dto.response.MaintenanceScheduleResponse;
import com.farmverse.equipment.service.MaintenanceScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment/maintenance-schedules")
@RequiredArgsConstructor
@Tag(name = "Maintenance Schedules", description = "Endpoints for configuring periodic servicing intervals and automated alerts")
public class MaintenanceScheduleController {

    private final MaintenanceScheduleService scheduleService;

    @PostMapping
    @Operation(summary = "Create an automated maintenance schedule rule by date or operating hours")
    public ResponseEntity<MaintenanceScheduleResponse> createSchedule(@Valid @RequestBody MaintenanceScheduleRequest request) {
        MaintenanceScheduleResponse response = scheduleService.createSchedule(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get list of all active maintenance schedules")
    public ResponseEntity<List<MaintenanceScheduleResponse>> getAllSchedules(@RequestParam(required = false) Long equipmentId) {
        if (equipmentId != null) {
            return ResponseEntity.ok(scheduleService.getSchedulesByEquipment(equipmentId));
        }
        return ResponseEntity.ok(scheduleService.getAllActiveSchedules());
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Get schedules with service due date approaching within alert threshold")
    public ResponseEntity<List<MaintenanceScheduleResponse>> getUpcoming() {
        return ResponseEntity.ok(scheduleService.getUpcomingServices());
    }

    @GetMapping("/overdue")
    @Operation(summary = "Get schedules that have breached due date or operating hour thresholds")
    public ResponseEntity<List<MaintenanceScheduleResponse>> getOverdue() {
        return ResponseEntity.ok(scheduleService.getOverdueServices());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get schedule configuration by ID")
    public ResponseEntity<MaintenanceScheduleResponse> getScheduleById(@PathVariable Long id) {
        return ResponseEntity.ok(scheduleService.getScheduleById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update maintenance schedule thresholds and interval parameters")
    public ResponseEntity<MaintenanceScheduleResponse> updateSchedule(@PathVariable Long id, @Valid @RequestBody MaintenanceScheduleRequest request) {
        return ResponseEntity.ok(scheduleService.updateSchedule(id, request));
    }

    @PostMapping("/evaluate")
    @Operation(summary = "Trigger on-demand evaluation of automated maintenance alerts")
    public ResponseEntity<String> evaluateAlerts() {
        scheduleService.evaluateAutomatedAlerts();
        return ResponseEntity.ok("Maintenance alert scan completed successfully.");
    }
}

