package com.farmverse.equipment.service.impl;

import com.farmverse.equipment.dto.request.MaintenanceScheduleRequest;
import com.farmverse.equipment.dto.response.MaintenanceScheduleResponse;
import com.farmverse.equipment.entity.Equipment;
import com.farmverse.equipment.entity.MaintenanceSchedule;
import com.farmverse.equipment.enums.NotificationSeverity;
import com.farmverse.equipment.enums.NotificationType;
import com.farmverse.equipment.exception.ResourceNotFoundException;
import com.farmverse.equipment.mapper.EquipmentModelMapper;
import com.farmverse.equipment.repository.EquipmentRepository;
import com.farmverse.equipment.repository.MaintenanceScheduleRepository;
import com.farmverse.equipment.service.MaintenanceScheduleService;
import com.farmverse.equipment.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MaintenanceScheduleServiceImpl implements MaintenanceScheduleService {

    private final MaintenanceScheduleRepository scheduleRepository;
    private final EquipmentRepository equipmentRepository;
    private final NotificationService notificationService;
    private final EquipmentModelMapper mapper;

    @Override
    @Transactional
    public MaintenanceScheduleResponse createSchedule(MaintenanceScheduleRequest request) {
        log.info("Creating maintenance schedule for equipment ID: {}", request.getEquipmentId());

        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + request.getEquipmentId()));

        LocalDate nextDueDate = request.getNextDueDate();
        if (nextDueDate == null && request.getIntervalDays() != null) {
            LocalDate baseDate = request.getLastServiceDate() != null ? request.getLastServiceDate() : LocalDate.now();
            nextDueDate = baseDate.plusDays(request.getIntervalDays());
        }

        BigDecimal nextDueHours = request.getNextDueHours();
        if (nextDueHours == null && request.getIntervalHours() != null) {
            BigDecimal baseHours = request.getLastServiceHours() != null ? request.getLastServiceHours() : equipment.getCurrentOperatingHours();
            nextDueHours = baseHours.add(request.getIntervalHours());
        }

        MaintenanceSchedule schedule = MaintenanceSchedule.builder()
                .equipment(equipment)
                .serviceName(request.getServiceName().trim())
                .maintenanceType(request.getMaintenanceType())
                .intervalDays(request.getIntervalDays())
                .intervalHours(request.getIntervalHours())
                .lastServiceDate(request.getLastServiceDate())
                .lastServiceHours(request.getLastServiceHours())
                .nextDueDate(nextDueDate)
                .nextDueHours(nextDueHours)
                .advanceAlertDays(request.getAdvanceAlertDays() != null ? request.getAdvanceAlertDays() : 7)
                .advanceAlertHours(request.getAdvanceAlertHours() != null ? request.getAdvanceAlertHours() : BigDecimal.valueOf(25.0))
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .remarks(request.getRemarks())
                .build();

        MaintenanceSchedule saved = scheduleRepository.save(schedule);
        log.info("Maintenance schedule created with ID: {}", saved.getId());
        return mapper.toMaintenanceScheduleResponse(saved);
    }

    @Override
    @Transactional
    public MaintenanceScheduleResponse updateSchedule(Long id, MaintenanceScheduleRequest request) {
        MaintenanceSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance schedule not found with ID: " + id));

        schedule.setServiceName(request.getServiceName().trim());
        schedule.setMaintenanceType(request.getMaintenanceType());
        schedule.setIntervalDays(request.getIntervalDays());
        schedule.setIntervalHours(request.getIntervalHours());
        schedule.setLastServiceDate(request.getLastServiceDate());
        schedule.setLastServiceHours(request.getLastServiceHours());
        schedule.setNextDueDate(request.getNextDueDate());
        schedule.setNextDueHours(request.getNextDueHours());
        if (request.getAdvanceAlertDays() != null) {
            schedule.setAdvanceAlertDays(request.getAdvanceAlertDays());
        }
        if (request.getAdvanceAlertHours() != null) {
            schedule.setAdvanceAlertHours(request.getAdvanceAlertHours());
        }
        if (request.getIsActive() != null) {
            schedule.setIsActive(request.getIsActive());
        }
        schedule.setRemarks(request.getRemarks());

        MaintenanceSchedule updated = scheduleRepository.save(schedule);
        log.info("Maintenance schedule ID {} updated", id);
        return mapper.toMaintenanceScheduleResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public MaintenanceScheduleResponse getScheduleById(Long id) {
        MaintenanceSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance schedule not found with ID: " + id));
        return mapper.toMaintenanceScheduleResponse(schedule);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaintenanceScheduleResponse> getSchedulesByEquipment(Long equipmentId) {
        return scheduleRepository.findByEquipmentIdAndIsActiveTrue(equipmentId).stream()
                .map(mapper::toMaintenanceScheduleResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaintenanceScheduleResponse> getAllActiveSchedules() {
        return scheduleRepository.findByIsActiveTrue().stream()
                .map(mapper::toMaintenanceScheduleResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaintenanceScheduleResponse> getUpcomingServices() {
        return scheduleRepository.findByIsActiveTrue().stream()
                .map(mapper::toMaintenanceScheduleResponse)
                .filter(MaintenanceScheduleResponse::getIsUpcoming)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaintenanceScheduleResponse> getOverdueServices() {
        return scheduleRepository.findByIsActiveTrue().stream()
                .map(mapper::toMaintenanceScheduleResponse)
                .filter(MaintenanceScheduleResponse::getIsOverdue)
                .toList();
    }

    /**
     * Periodic evaluation (runs daily or manually) to scan schedules against current date & hours
     */
    @Scheduled(cron = "0 0 6 * * *") // Run 6 AM every day
    @Override
    @Transactional
    public void evaluateAutomatedAlerts() {
        log.info("Evaluating automated maintenance schedule alerts...");
        List<MaintenanceSchedule> schedules = scheduleRepository.findByIsActiveTrue();
        LocalDate today = LocalDate.now();

        for (MaintenanceSchedule s : schedules) {
            Equipment eq = s.getEquipment();
            if (eq == null || !Boolean.TRUE.equals(eq.getIsActive())) continue;

            // Date Overdue
            if (s.getNextDueDate() != null && s.getNextDueDate().isBefore(today)) {
                notificationService.createNotification(
                        eq,
                        "Overdue Maintenance Alert (Date Exceeded)",
                        String.format("Scheduled service '%s' for %s (%s) was due on %s. Please book service.",
                                s.getServiceName(), eq.getName(), eq.getRegistrationNumber(), s.getNextDueDate()),
                        NotificationType.MAINTENANCE_OVERDUE,
                        NotificationSeverity.WARNING
                );
            }
            // Date Approaching
            else if (s.getNextDueDate() != null && s.getNextDueDate().isBefore(today.plusDays(s.getAdvanceAlertDays()))) {
                notificationService.createNotification(
                        eq,
                        "Upcoming Maintenance Window",
                        String.format("Service '%s' for %s is approaching due date (%s).",
                                s.getServiceName(), eq.getName(), s.getNextDueDate()),
                        NotificationType.MAINTENANCE_APPROACHING,
                        NotificationSeverity.INFO
                );
            }

            // Operating Hours Overdue
            if (s.getNextDueHours() != null && eq.getCurrentOperatingHours().compareTo(s.getNextDueHours()) >= 0) {
                notificationService.createNotification(
                        eq,
                        "Operating Hour Threshold Exceeded",
                        String.format("Equipment %s has accumulated %.2f hrs, exceeding service threshold of %.2f hrs for '%s'.",
                                eq.getName(), eq.getCurrentOperatingHours(), s.getNextDueHours(), s.getServiceName()),
                        NotificationType.MAINTENANCE_OVERDUE,
                        NotificationSeverity.ERROR
                );
            }
        }
    }
}

