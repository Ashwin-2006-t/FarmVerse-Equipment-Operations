package com.farmverse.equipment.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingCreateRequest {

    @NotNull(message = "Equipment ID is required")
    private Long equipmentId;

    @NotNull(message = "Booking start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "Booking end time is required")
    private LocalDateTime endTime;

    @NotBlank(message = "Booking purpose is required")
    @Size(max = 255, message = "Purpose cannot exceed 255 characters")
    private String purpose;

    @NotBlank(message = "Work location / farm plot is required")
    @Size(max = 255, message = "Work location cannot exceed 255 characters")
    private String workLocation;

    @NotBlank(message = "Farm ID is required")
    private String farmId;

    private String organizationId;
}

