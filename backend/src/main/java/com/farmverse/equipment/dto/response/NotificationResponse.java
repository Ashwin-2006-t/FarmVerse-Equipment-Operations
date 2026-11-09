package com.farmverse.equipment.dto.response;

import com.farmverse.equipment.enums.NotificationSeverity;
import com.farmverse.equipment.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private Long equipmentId;
    private String equipmentName;
    private String title;
    private String message;
    private NotificationType notificationType;
    private NotificationSeverity severity;
    private Boolean isRead;
    private String organizationId;
    private LocalDateTime createdAt;
}

