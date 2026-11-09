package com.farmverse.equipment.controller;

import com.farmverse.equipment.dto.request.EquipmentCreateRequest;
import com.farmverse.equipment.dto.request.EquipmentStatusUpdateRequest;
import com.farmverse.equipment.dto.request.EquipmentUpdateRequest;
import com.farmverse.equipment.dto.response.*;
import com.farmverse.equipment.enums.EquipmentCategory;
import com.farmverse.equipment.enums.EquipmentStatus;
import com.farmverse.equipment.service.BookingService;
import com.farmverse.equipment.service.EquipmentService;
import com.farmverse.equipment.service.MaintenanceService;
import com.farmverse.equipment.service.UsageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Equipment Management", description = "Endpoints for registering, browsing, editing and deactivating agricultural machinery")
public class EquipmentController {

    private final EquipmentService equipmentService;
    private final BookingService bookingService;
    private final UsageService usageService;
    private final MaintenanceService maintenanceService;

    @PostMapping
    @Operation(summary = "Register new agricultural equipment")
    public ResponseEntity<EquipmentResponse> createEquipment(@Valid @RequestBody EquipmentCreateRequest request) {
        EquipmentResponse response = equipmentService.createEquipment(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "List all equipment with multi-criteria filtering, search and pagination")
    public ResponseEntity<PagedResponse<EquipmentResponse>> getAllEquipment(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) EquipmentCategory category,
            @RequestParam(required = false) EquipmentStatus status,
            @RequestParam(required = false) String farmId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {

        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));

        PagedResponse<EquipmentResponse> response = equipmentService.getAllEquipment(search, category, status, farmId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/active")
    @Operation(summary = "Get list of all active machinery")
    public ResponseEntity<List<EquipmentResponse>> getActiveEquipment() {
        return ResponseEntity.ok(equipmentService.getAllActiveEquipment());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed record of a single equipment by ID")
    public ResponseEntity<EquipmentResponse> getEquipmentById(@PathVariable Long id) {
        return ResponseEntity.ok(equipmentService.getEquipmentById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update equipment specifications and attributes")
    public ResponseEntity<EquipmentResponse> updateEquipment(@PathVariable Long id, @Valid @RequestBody EquipmentUpdateRequest request) {
        return ResponseEntity.ok(equipmentService.updateEquipment(id, request));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update operational status of equipment (AVAILABLE, UNDER_MAINTENANCE, OUT_OF_SERVICE, etc.)")
    public ResponseEntity<EquipmentResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody EquipmentStatusUpdateRequest request) {
        return ResponseEntity.ok(equipmentService.updateEquipmentStatus(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deactivate or delete equipment based on business retention policy")
    public ResponseEntity<Void> deleteOrDeactivateEquipment(@PathVariable Long id) {
        try {
            equipmentService.deleteEquipment(id);
        } catch (Exception ex) {
            log.info("Historical data exists; performing soft deactivation instead: {}", ex.getMessage());
            equipmentService.deactivateEquipment(id);
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/bookings")
    @Operation(summary = "Get historical and upcoming bookings for a specific equipment")
    public ResponseEntity<List<BookingResponse>> getEquipmentBookings(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingsByEquipment(id));
    }

    @GetMapping("/{id}/usage")
    @Operation(summary = "Get complete operational usage history for a specific equipment")
    public ResponseEntity<List<UsageResponse>> getEquipmentUsage(@PathVariable Long id) {
        return ResponseEntity.ok(usageService.getUsageByEquipment(id));
    }

    @GetMapping("/{id}/maintenance")
    @Operation(summary = "Get complete maintenance history for a specific equipment")
    public ResponseEntity<List<MaintenanceResponse>> getEquipmentMaintenance(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.getMaintenanceByEquipment(id));
    }
}

