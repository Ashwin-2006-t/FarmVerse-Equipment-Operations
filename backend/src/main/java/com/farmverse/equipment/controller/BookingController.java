package com.farmverse.equipment.controller;

import com.farmverse.equipment.dto.request.BookingCreateRequest;
import com.farmverse.equipment.dto.request.BookingDecisionRequest;
import com.farmverse.equipment.dto.response.BookingResponse;
import com.farmverse.equipment.dto.response.PagedResponse;
import com.farmverse.equipment.enums.BookingStatus;
import com.farmverse.equipment.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/equipment/bookings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Booking Operations", description = "Endpoints for reserving machinery, calendar visualization and approval workflows")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @Operation(summary = "Submit a new equipment booking request (Double-booking protected)")
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingCreateRequest request) {
        BookingResponse response = bookingService.createBooking(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "List all booking requests with filtering and pagination")
    public ResponseEntity<PagedResponse<BookingResponse>> getAllBookings(
            @RequestParam(required = false) Long equipmentId,
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String farmId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {

        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));

        return ResponseEntity.ok(bookingService.getAllBookings(equipmentId, status, userId, farmId, pageable));
    }

    @GetMapping("/calendar")
    @Operation(summary = "Get bookings formatted for calendar schedule visualization")
    public ResponseEntity<List<BookingResponse>> getCalendarBookings(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(bookingService.getBookingsForCalendar(start, end));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get specific booking details by ID")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @PatchMapping("/{id}/approve")
    @Operation(summary = "Approve pending equipment booking (Admin role)")
    public ResponseEntity<BookingResponse> approveBooking(@PathVariable Long id, @RequestBody(required = false) BookingDecisionRequest request) {
        return ResponseEntity.ok(bookingService.approveBooking(id, request));
    }

    @PatchMapping("/{id}/reject")
    @Operation(summary = "Reject pending equipment booking with mandatory or optional remarks")
    public ResponseEntity<BookingResponse> rejectBooking(@PathVariable Long id, @RequestBody(required = false) BookingDecisionRequest request) {
        return ResponseEntity.ok(bookingService.rejectBooking(id, request));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel an existing booking reservation")
    public ResponseEntity<BookingResponse> cancelBooking(@PathVariable Long id, @RequestBody(required = false) BookingDecisionRequest request) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, request));
    }
}

