package com.farmverse.equipment.controller;

import com.farmverse.equipment.dto.request.UsageCreateRequest;
import com.farmverse.equipment.dto.response.PagedResponse;
import com.farmverse.equipment.dto.response.UsageResponse;
import com.farmverse.equipment.service.UsageService;
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

@RestController
@RequestMapping("/api/equipment/usage")
@RequiredArgsConstructor
@Tag(name = "Usage Tracking", description = "Endpoints for logging completed machinery hours, fuel consumption and costs")
public class UsageController {

    private final UsageService usageService;

    @PostMapping
    @Operation(summary = "Log equipment usage, update total machine hours and calculate operating expenses")
    public ResponseEntity<UsageResponse> recordUsage(@Valid @RequestBody UsageCreateRequest request) {
        UsageResponse response = usageService.recordUsage(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "List usage history with filtering and pagination")
    public ResponseEntity<PagedResponse<UsageResponse>> getAllUsage(
            @RequestParam(required = false) Long equipmentId,
            @RequestParam(required = false) String farmId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "usageDate,desc") String sort) {

        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));

        return ResponseEntity.ok(usageService.getAllUsage(equipmentId, farmId, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get specific usage log details by ID")
    public ResponseEntity<UsageResponse> getUsageById(@PathVariable Long id) {
        return ResponseEntity.ok(usageService.getUsageById(id));
    }
}

