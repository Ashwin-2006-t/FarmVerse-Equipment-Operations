package com.farmverse.equipment.service.impl;

import com.farmverse.equipment.dto.response.NotificationResponse;
import com.farmverse.equipment.entity.Equipment;
import com.farmverse.equipment.entity.EquipmentNotification;
import com.farmverse.equipment.enums.NotificationSeverity;
import com.farmverse.equipment.enums.NotificationType;
import com.farmverse.equipment.mapper.EquipmentModelMapper;
import com.farmverse.equipment.repository.NotificationRepository;
import com.farmverse.equipment.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final EquipmentModelMapper mapper;

    @Override
    @Transactional
    public NotificationResponse createNotification(Equipment equipment,
                                                   String title,
                                                   String message,
                                                   NotificationType type,
                                                   NotificationSeverity severity) {
        String orgId = equipment != null ? equipment.getOrganizationId() : "ORG-FV-001";

        EquipmentNotification notification = EquipmentNotification.builder()
                .equipment(equipment)
                .title(title)
                .message(message)
                .notificationType(type)
                .severity(severity != null ? severity : NotificationSeverity.INFO)
                .isRead(false)
                .organizationId(orgId)
                .build();

        EquipmentNotification saved = notificationRepository.save(notification);
        log.info("System notification created: [{}] {}", type, title);
        return mapper.toNotificationResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getRecentNotifications() {
        return notificationRepository.findTop25ByOrderByCreatedAtDesc().stream()
                .map(mapper::toNotificationResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotifications() {
        return notificationRepository.findByIsReadFalseOrderByCreatedAtDesc().stream()
                .map(mapper::toNotificationResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount() {
        return notificationRepository.countByIsReadFalse();
    }

    @Override
    @Transactional
    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        List<EquipmentNotification> unread = notificationRepository.findByIsReadFalseOrderByCreatedAtDesc();
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }
}

