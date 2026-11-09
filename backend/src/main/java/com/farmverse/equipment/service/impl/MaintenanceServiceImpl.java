package com.farmverse.equipment.service.impl;

import com.farmverse.equipment.dto.request.MaintenanceCreateRequest;
import com.farmverse.equipment.dto.request.MaintenanceUpdateRequest;
import com.farmverse.equipment.dto.response.MaintenanceResponse;
import com.farmverse.equipment.dto.response.PagedResponse;
import com.farmverse.equipment.entity.Equipment;
import com.farmverse.equipment.entity.MaintenanceRecord;
import com.farmverse.equipment.entity.MaintenanceSchedule;
import com.farmverse.equipment.enums.EquipmentStatus;
import com.farmverse.equipment.enums.MaintenanceStatus;
import com.farmverse.equipment.enums.MaintenanceType;
import com.farmverse.equipment.enums.NotificationSeverity;
import com.farmverse.equipment.enums.NotificationType;
import com.farmverse.equipment.exception.ResourceNotFoundException;
import com.farmverse.equipment.mapper.EquipmentModelMapper;
import com.farmverse.equipment.repository.EquipmentRepository;
import com.farmverse.equipment.repository.MaintenanceRepository;
import com.farmverse.equipment.repository.MaintenanceScheduleRepository;
import com.farmverse.equipment.service.MaintenanceService;
import com.farmverse.equipment.service.NotificationService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MaintenanceServiceImpl implements MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final EquipmentRepository equipmentRepository;
    private final MaintenanceScheduleRepository scheduleRepository;
    private final NotificationService notificationService;
    private final EquipmentModelMapper mapper;

    @Override
    @Transactional
    public MaintenanceResponse createMaintenanceRecord(MaintenanceCreateRequest request) {
        log.info("Creating maintenance record for equipment ID: {}", request.getEquipmentId());

        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + request.getEquipmentId()));

        BigDecimal labourCost = request.getLabourCost() != null ? request.getLabourCost() : BigDecimal.ZERO;
        BigDecimal sparePartsCost = request.getSparePartsCost() != null ? request.getSparePartsCost() : BigDecimal.ZERO;
        BigDecimal additionalCost = request.getAdditionalCost() != null ? request.getAdditionalCost() : BigDecimal.ZERO;
        BigDecimal totalCost = labourCost.add(sparePartsCost).add(additionalCost).setScale(2, RoundingMode.HALF_UP);

        MaintenanceStatus initialStatus = request.getStatus() != null ? request.getStatus() : MaintenanceStatus.SCHEDULED;

        MaintenanceRecord record = MaintenanceRecord.builder()
                .equipment(equipment)
                .maintenanceType(request.getMaintenanceType())
                .description(request.getDescription().trim())
                .serviceDate(request.getServiceDate())
                .serviceProvider(request.getServiceProvider().trim())
                .technicianName(request.getTechnicianName().trim())
                .labourCost(labourCost)
                .sparePartsCost(sparePartsCost)
                .additionalCost(additionalCost)
                .totalCost(totalCost)
                .previousOperatingHours(request.getPreviousOperatingHours())
                .nextServiceDate(request.getNextServiceDate())
                .nextServiceOperatingHourThreshold(request.getNextServiceOperatingHourThreshold())
                .status(initialStatus)
                .remarks(request.getRemarks())
                .build();

        // Business Rule: Update equipment status based on maintenance state and type
        if (request.getMaintenanceType() == MaintenanceType.BREAKDOWN_REPAIR || 
            request.getMaintenanceType() == MaintenanceType.EMERGENCY_MAINTENANCE) {
            equipment.setStatus(EquipmentStatus.UNDER_MAINTENANCE);
            notificationService.createNotification(
                    equipment,
                    "Equipment Breakdown Logged",
                    String.format("Breakdown reported for %s (%s). Technician: %s. Description: %s",
                            equipment.getName(), equipment.getRegistrationNumber(), record.getTechnicianName(), record.getDescription()),
                    NotificationType.BREAKDOWN_REPORTED,
                    NotificationSeverity.ERROR
            );
        } else if (initialStatus == MaintenanceStatus.IN_PROGRESS || 
                  (initialStatus == MaintenanceStatus.SCHEDULED && request.getServiceDate().isEqual(LocalDate.now()))) {
            equipment.setStatus(EquipmentStatus.UNDER_MAINTENANCE);
        }

        equipmentRepository.save(equipment);
        MaintenanceRecord saved = maintenanceRepository.save(record);

        // If completed right away, synchronize schedule
        if (initialStatus == MaintenanceStatus.COMPLETED) {
            syncCompletedMaintenanceWithSchedules(equipment, saved);
        }

        log.info("Maintenance record created successfully with ID: {}", saved.getId());
        return mapper.toMaintenanceResponse(saved);
    }

    @Override
    @Transactional
    public MaintenanceResponse updateMaintenanceRecord(Long id, MaintenanceUpdateRequest request) {
        log.info("Updating maintenance record with ID: {}", id);

        MaintenanceRecord record = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance record not found with ID: " + id));

        Equipment equipment = record.getEquipment();

        BigDecimal labourCost = request.getLabourCost() != null ? request.getLabourCost() : BigDecimal.ZERO;
        BigDecimal sparePartsCost = request.getSparePartsCost() != null ? request.getSparePartsCost() : BigDecimal.ZERO;
        BigDecimal additionalCost = request.getAdditionalCost() != null ? request.getAdditionalCost() : BigDecimal.ZERO;
        BigDecimal totalCost = labourCost.add(sparePartsCost).add(additionalCost).setScale(2, RoundingMode.HALF_UP);

        record.setMaintenanceType(request.getMaintenanceType());
        record.setDescription(request.getDescription().trim());
        record.setServiceDate(request.getServiceDate());
        record.setServiceProvider(request.getServiceProvider().trim());
        record.setTechnicianName(request.getTechnicianName().trim());
        record.setLabourCost(labourCost);
        record.setSparePartsCost(sparePartsCost);
        record.setAdditionalCost(additionalCost);
        record.setTotalCost(totalCost);
        record.setPreviousOperatingHours(request.getPreviousOperatingHours());
        record.setNextServiceDate(request.getNextServiceDate());
        record.setNextServiceOperatingHourThreshold(request.getNextServiceOperatingHourThreshold());
        record.setStatus(request.getStatus());
        record.setRemarks(request.getRemarks());

        // Business Rule: Update equipment status on status transitions
        if (request.getStatus() == MaintenanceStatus.IN_PROGRESS) {
            equipment.setStatus(EquipmentStatus.UNDER_MAINTENANCE);
            equipmentRepository.save(equipment);
        } else if (request.getStatus() == MaintenanceStatus.COMPLETED) {
            // Check if there are other in-progress maintenance records for this equipment
            List<MaintenanceRecord> otherActive = maintenanceRepository.findByEquipmentIdOrderByServiceDateDesc(equipment.getId())
                    .stream()
                    .filter(m -> !m.getId().equals(id) && 
                            (m.getStatus() == MaintenanceStatus.IN_PROGRESS || m.getStatus() == MaintenanceStatus.SCHEDULED))
                    .toList();

            if (otherActive.isEmpty()) {
                equipment.setStatus(EquipmentStatus.AVAILABLE);
                equipmentRepository.save(equipment);
            }

            syncCompletedMaintenanceWithSchedules(equipment, record);
        }

        MaintenanceRecord updated = maintenanceRepository.save(record);
        log.info("Maintenance record ID {} updated successfully", id);
        return mapper.toMaintenanceResponse(updated);
    }

    private void syncCompletedMaintenanceWithSchedules(Equipment equipment, MaintenanceRecord record) {
        List<MaintenanceSchedule> schedules = scheduleRepository.findByEquipmentIdAndIsActiveTrue(equipment.getId());
        for (MaintenanceSchedule s : schedules) {
            if (s.getMaintenanceType() == record.getMaintenanceType()) {
                s.setLastServiceDate(record.getServiceDate());
                s.setLastServiceHours(equipment.getCurrentOperatingHours());

                if (s.getIntervalDays() != null) {
                    s.setNextDueDate(record.getServiceDate().plusDays(s.getIntervalDays()));
                }
                if (s.getIntervalHours() != null) {
                    s.setNextDueHours(equipment.getCurrentOperatingHours().add(s.getIntervalHours()));
                }
                scheduleRepository.save(s);
                log.info("Synchronized maintenance schedule #{} for equipment {}", s.getId(), equipment.getName());
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public MaintenanceResponse getMaintenanceById(Long id) {
        MaintenanceRecord record = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance record not found with ID: " + id));
        return mapper.toMaintenanceResponse(record);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<MaintenanceResponse> getAllMaintenance(Long equipmentId,
                                                                 MaintenanceStatus status,
                                                                 MaintenanceType type,
                                                                 Pageable pageable) {
        Specification<MaintenanceRecord> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (equipmentId != null) {
                predicates.add(cb.equal(root.get("equipment").get("id"), equipmentId));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (type != null) {
                predicates.add(cb.equal(root.get("maintenanceType"), type));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<MaintenanceRecord> page = maintenanceRepository.findAll(spec, pageable);
        List<MaintenanceResponse> content = page.getContent().stream()
                .map(mapper::toMaintenanceResponse)
                .toList();

        return PagedResponse.<MaintenanceResponse>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .empty(page.isEmpty())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaintenanceResponse> getMaintenanceByEquipment(Long equipmentId) {
        return maintenanceRepository.findByEquipmentIdOrderByServiceDateDesc(equipmentId).stream()
                .map(mapper::toMaintenanceResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaintenanceResponse> getActiveMaintenance() {
        return maintenanceRepository.findByStatusIn(Arrays.asList(MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS))
                .stream()
                .map(mapper::toMaintenanceResponse)
                .toList();
    }
}

