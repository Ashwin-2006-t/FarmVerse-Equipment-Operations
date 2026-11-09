package com.farmverse.equipment.service;

import com.farmverse.equipment.dto.response.NotificationResponse;
import com.farmverse.equipment.entity.Equipment;
import com.farmverse.equipment.enums.NotificationSeverity;
import com.farmverse.equipment.enums.NotificationType;

import java.util.List;

public interface NotificationService {

    NotificationResponse createNotification(Equipment equipment,
                                           String title,
                                           String message,
                                           NotificationType type,
                                           NotificationSeverity severity);

    List<NotificationResponse> getRecentNotifications();

    List<NotificationResponse> getUnreadNotifications();

    long getUnreadCount();

    void markAsRead(Long id);

    void markAllAsRead();
}

