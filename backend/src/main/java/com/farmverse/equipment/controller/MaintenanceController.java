package com.farmverse.equipment.controller;

import com.farmverse.equipment.dto.request.MaintenanceCreateRequest;
import com.farmverse.equipment.dto.request.MaintenanceUpdateRequest;
import com.farmverse.equipment.dto.response.MaintenanceResponse;
import com.farmverse.equipment.dto.response.PagedResponse;
import com.farmverse.equipment.enums.MaintenanceStatus;
import com.farmverse.equipment.enums.MaintenanceType;
import com.farmverse.equipment.service.MaintenanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment/maintenance")
@RequiredArgsConstructor
@Tag(name = "Maintenance Management", description = "Endpoints for creating and tracking servicing, repairs and breakdown incidents")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @PostMapping
    @Operation(summary = "Create a maintenance or breakdown repair record")
    public ResponseEntity<MaintenanceResponse> createMaintenance(@Valid @RequestBody MaintenanceCreateRequest request) {
        MaintenanceResponse response = maintenanceService.createMaintenanceRecord(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "List maintenance records with status and type filtering")
    public ResponseEntity<PagedResponse<MaintenanceResponse>> getAllMaintenance(
            @RequestParam(required = false) Long equipmentId,
            @RequestParam(required = false) MaintenanceStatus status,
            @RequestParam(required = false) MaintenanceType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "serviceDate,desc") String sort) {

        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));

        return ResponseEntity.ok(maintenanceService.getAllMaintenance(equipmentId, status, type, pageable));
    }

    @GetMapping("/active")
    @Operation(summary = "Get list of equipment currently undergoing active servicing or repair")
    public ResponseEntity<List<MaintenanceResponse>> getActiveMaintenance() {
        return ResponseEntity.ok(maintenanceService.getActiveMaintenance());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get specific maintenance record by ID")
    public ResponseEntity<MaintenanceResponse> getMaintenanceById(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.getMaintenanceById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update maintenance details, costs, technician notes and status")
    public ResponseEntity<MaintenanceResponse> updateMaintenance(@PathVariable Long id, @Valid @RequestBody MaintenanceUpdateRequest request) {
        return ResponseEntity.ok(maintenanceService.updateMaintenanceRecord(id, request));
    }
}

