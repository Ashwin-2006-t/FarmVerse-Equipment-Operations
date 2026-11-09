package com.farmverse.equipment.service.impl;

import com.farmverse.equipment.dto.request.UsageCreateRequest;
import com.farmverse.equipment.dto.response.PagedResponse;
import com.farmverse.equipment.dto.response.UsageResponse;
import com.farmverse.equipment.entity.Equipment;
import com.farmverse.equipment.entity.EquipmentBooking;
import com.farmverse.equipment.entity.EquipmentUsage;
import com.farmverse.equipment.entity.MaintenanceSchedule;
import com.farmverse.equipment.enums.BookingStatus;
import com.farmverse.equipment.enums.EquipmentStatus;
import com.farmverse.equipment.enums.NotificationSeverity;
import com.farmverse.equipment.enums.NotificationType;
import com.farmverse.equipment.exception.BusinessRuleException;
import com.farmverse.equipment.exception.ConflictException;
import com.farmverse.equipment.exception.ResourceNotFoundException;
import com.farmverse.equipment.mapper.EquipmentModelMapper;
import com.farmverse.equipment.repository.BookingRepository;
import com.farmverse.equipment.repository.EquipmentRepository;
import com.farmverse.equipment.repository.MaintenanceScheduleRepository;
import com.farmverse.equipment.repository.UsageRepository;
import com.farmverse.equipment.service.NotificationService;
import com.farmverse.equipment.service.UsageService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UsageServiceImpl implements UsageService {

    private final UsageRepository usageRepository;
    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final MaintenanceScheduleRepository scheduleRepository;
    private final NotificationService notificationService;
    private final EquipmentModelMapper mapper;

    private static final BigDecimal DEFAULT_FUEL_RATE_PER_LITRE = new BigDecimal("1.25");

    @Override
    @Transactional
    public UsageResponse recordUsage(UsageCreateRequest request) {
        log.info("Recording equipment usage for equipment ID: {}", request.getEquipmentId());

        // 1. Validation: Operating hours
        if (request.getEndOperatingHours().compareTo(request.getStartOperatingHours()) < 0) {
            throw new BusinessRuleException(String.format(
                    "Invalid operating hours: Ending hours (%.2f) cannot be lower than starting hours (%.2f).",
                    request.getEndOperatingHours(), request.getStartOperatingHours()
            ));
        }

        if (request.getFuelConsumedLitres().compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessRuleException("Fuel consumed cannot be negative.");
        }

        // 2. Load Equipment
        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + request.getEquipmentId()));

        // 3. Prevent duplicate usage for the same booking
        EquipmentBooking booking = null;
        if (request.getBookingId() != null) {
            if (usageRepository.existsByBookingId(request.getBookingId())) {
                throw new ConflictException("A usage log has already been submitted for booking #" + request.getBookingId());
            }
            booking = bookingRepository.findById(request.getBookingId())
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + request.getBookingId()));

            // Mark booking as COMPLETED
            booking.setStatus(BookingStatus.COMPLETED);
            bookingRepository.save(booking);
        }

        // 4. Calculate total operating hours
        BigDecimal totalOperatingHours = request.getEndOperatingHours().subtract(request.getStartOperatingHours());

        // 5. Calculate fuel cost & total usage cost
        BigDecimal fuelCost = request.getFuelCost();
        if (fuelCost == null || fuelCost.compareTo(BigDecimal.ZERO) <= 0) {
            fuelCost = request.getFuelConsumedLitres().multiply(DEFAULT_FUEL_RATE_PER_LITRE).setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal additionalExpenses = request.getAdditionalExpenses() != null ? request.getAdditionalExpenses() : BigDecimal.ZERO;
        BigDecimal totalUsageCost = fuelCost.add(additionalExpenses).setScale(2, RoundingMode.HALF_UP);

        // 6. Build and save Usage Record
        EquipmentUsage usage = EquipmentUsage.builder()
                .equipment(equipment)
                .booking(booking)
                .farmId(request.getFarmId().trim())
                .organizationId(StringUtils.hasText(request.getOrganizationId()) ? request.getOrganizationId().trim() : equipment.getOrganizationId())
                .usageDate(request.getUsageDate())
                .startOperatingHours(request.getStartOperatingHours())
                .endOperatingHours(request.getEndOperatingHours())
                .totalOperatingHours(totalOperatingHours)
                .fuelConsumedLitres(request.getFuelConsumedLitres())
                .fuelCost(fuelCost)
                .operatorDetails(request.getOperatorDetails().trim())
                .workDescription(request.getWorkDescription().trim())
                .additionalExpenses(additionalExpenses)
                .totalUsageCost(totalUsageCost)
                .remarks(request.getRemarks())
                .build();

        EquipmentUsage saved = usageRepository.save(usage);

        // 7. Update Equipment currentOperatingHours & availability status
        equipment.setCurrentOperatingHours(request.getEndOperatingHours());
        if (equipment.getStatus() == EquipmentStatus.IN_USE || equipment.getStatus() == EquipmentStatus.BOOKED) {
            equipment.setStatus(EquipmentStatus.AVAILABLE);
        }
        equipmentRepository.save(equipment);

        // 8. Automated Schedule Threshold Alerts Trigger: Check if equipment reached maintenance threshold
        List<MaintenanceSchedule> activeSchedules = scheduleRepository.findByEquipmentIdAndIsActiveTrue(equipment.getId());
        for (MaintenanceSchedule schedule : activeSchedules) {
            if (schedule.getNextDueHours() != null) {
                if (equipment.getCurrentOperatingHours().compareTo(schedule.getNextDueHours()) >= 0) {
                    notificationService.createNotification(
                            equipment,
                            "Maintenance Overdue (Operating Hours Exceeded)",
                            String.format("Equipment '%s' has reached %.2f operating hours, exceeding maintenance threshold of %.2f hrs for schedule '%s'.",
                                    equipment.getName(), equipment.getCurrentOperatingHours(), schedule.getNextDueHours(), schedule.getServiceName()),
                            NotificationType.MAINTENANCE_OVERDUE,
                            NotificationSeverity.ERROR
                    );
                } else if (schedule.getAdvanceAlertHours() != null &&
                        equipment.getCurrentOperatingHours().add(schedule.getAdvanceAlertHours()).compareTo(schedule.getNextDueHours()) >= 0) {
                    notificationService.createNotification(
                            equipment,
                            "Maintenance Approaching",
                            String.format("Equipment '%s' is approaching service threshold: current %.2f hrs, next service at %.2f hrs for '%s'.",
                                    equipment.getName(), equipment.getCurrentOperatingHours(), schedule.getNextDueHours(), schedule.getServiceName()),
                            NotificationType.MAINTENANCE_APPROACHING,
                            NotificationSeverity.WARNING
                    );
                }
            }
        }

        log.info("Equipment usage recorded successfully with ID: {}", saved.getId());
        return mapper.toUsageResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public UsageResponse getUsageById(Long id) {
        EquipmentUsage usage = usageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usage record not found with ID: " + id));
        return mapper.toUsageResponse(usage);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<UsageResponse> getAllUsage(Long equipmentId, String farmId, Pageable pageable) {
        Specification<EquipmentUsage> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (equipmentId != null) {
                predicates.add(cb.equal(root.get("equipment").get("id"), equipmentId));
            }
            if (StringUtils.hasText(farmId)) {
                predicates.add(cb.equal(root.get("farmId"), farmId.trim()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<EquipmentUsage> page = usageRepository.findAll(spec, pageable);
        List<UsageResponse> content = page.getContent().stream()
                .map(mapper::toUsageResponse)
                .toList();

        return PagedResponse.<UsageResponse>builder()
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
    public List<UsageResponse> getUsageByEquipment(Long equipmentId) {
        return usageRepository.findByEquipmentIdOrderByUsageDateDesc(equipmentId).stream()
                .map(mapper::toUsageResponse)
                .toList();
    }
}

