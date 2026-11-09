package com.farmverse.equipment.dto.response;

import com.farmverse.equipment.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private Long equipmentId;
    private String equipmentName;
    private String equipmentCategory;
    private String equipmentRegistrationNumber;
    private String equipmentImageUrl;
    private String userId;
    private String userName;
    private String userRole;
    private String farmId;
    private String organizationId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String purpose;
    private String workLocation;
    private BookingStatus status;
    private String approvalRemarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

