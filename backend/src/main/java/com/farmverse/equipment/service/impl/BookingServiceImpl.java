package com.farmverse.equipment.service.impl;

import com.farmverse.equipment.dto.request.BookingCreateRequest;
import com.farmverse.equipment.dto.request.BookingDecisionRequest;
import com.farmverse.equipment.dto.response.BookingResponse;
import com.farmverse.equipment.dto.response.PagedResponse;
import com.farmverse.equipment.entity.Equipment;
import com.farmverse.equipment.entity.EquipmentBooking;
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
import com.farmverse.equipment.security.UserPrincipal;
import com.farmverse.equipment.service.BookingService;
import com.farmverse.equipment.service.NotificationService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;
    private final NotificationService notificationService;
    private final EquipmentModelMapper mapper;

    @Override
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public BookingResponse createBooking(BookingCreateRequest request) {
        log.info("Processing booking request for equipment ID: {}", request.getEquipmentId());

        // 1. Validate dates
        if (request.getEndTime().isBefore(request.getStartTime()) || request.getEndTime().isEqual(request.getStartTime())) {
            throw new BusinessRuleException("Booking end time must be strictly after the start time.");
        }

        LocalDateTime now = LocalDateTime.now().minusMinutes(5); // allow minor clock drift
        if (request.getStartTime().isBefore(now)) {
            throw new BusinessRuleException("Cannot book equipment for past dates or times.");
        }

        // 2. Load equipment and validate condition/status
        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + request.getEquipmentId()));

        if (!Boolean.TRUE.equals(equipment.getIsActive())) {
            throw new BusinessRuleException("Equipment is currently inactive and unavailable for reservation.");
        }

        if (equipment.getStatus() == EquipmentStatus.UNDER_MAINTENANCE) {
            throw new BusinessRuleException("Equipment is currently undergoing maintenance and cannot be reserved.");
        }

        if (equipment.getStatus() == EquipmentStatus.OUT_OF_SERVICE) {
            throw new BusinessRuleException("Equipment is out of service due to mechanical breakdown or repair.");
        }

        if (equipment.getStatus() == EquipmentStatus.INACTIVE) {
            throw new BusinessRuleException("Equipment is decommissioned or inactive.");
        }

        // 3. Double-Booking Overlap Check: Check for existing APPROVED or IN_PROGRESS bookings
        List<EquipmentBooking> overlaps = bookingRepository.findConflictingBookings(
                equipment.getId(),
                request.getStartTime(),
                request.getEndTime()
        );

        if (!overlaps.isEmpty()) {
            EquipmentBooking conflict = overlaps.get(0);
            throw new ConflictException(String.format(
                    "Equipment double-booking conflict: Machinery '%s' is already reserved from %s to %s.",
                    equipment.getName(),
                    conflict.getStartTime(),
                    conflict.getEndTime()
            ));
        }

        // 4. Resolve authenticated user context
        String userId = "USR-FARMER-01";
        String userName = "Ramesh Patel";
        String userRole = "ROLE_FARMER";
        String orgId = StringUtils.hasText(request.getOrganizationId()) ? request.getOrganizationId() : equipment.getOrganizationId();

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            userId = principal.getId();
            userName = principal.getName();
            userRole = principal.getRole();
            if (StringUtils.hasText(principal.getOrganizationId())) {
                orgId = principal.getOrganizationId();
            }
        }

        EquipmentBooking booking = EquipmentBooking.builder()
                .equipment(equipment)
                .userId(userId)
                .userName(userName)
                .userRole(userRole)
                .farmId(request.getFarmId().trim())
                .organizationId(orgId)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose().trim())
                .workLocation(request.getWorkLocation().trim())
                .status(BookingStatus.PENDING)
                .build();

        EquipmentBooking saved = bookingRepository.save(booking);

        // Notify Admins
        notificationService.createNotification(
                equipment,
                "New Booking Request",
                String.format("Farmer %s submitted booking request for %s (%s) from %s to %s for '%s'.",
                        userName, equipment.getName(), equipment.getRegistrationNumber(),
                        request.getStartTime(), request.getEndTime(), request.getPurpose()),
                NotificationType.BOOKING_REQUESTED,
                NotificationSeverity.INFO
        );

        log.info("Booking request created with ID: {}", saved.getId());
        return mapper.toBookingResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id) {
        EquipmentBooking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking record not found with ID: " + id));
        return mapper.toBookingResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<BookingResponse> getAllBookings(Long equipmentId,
                                                         BookingStatus status,
                                                         String userId,
                                                         String farmId,
                                                         Pageable pageable) {
        Specification<EquipmentBooking> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (equipmentId != null) {
                predicates.add(cb.equal(root.get("equipment").get("id"), equipmentId));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (StringUtils.hasText(userId)) {
                predicates.add(cb.equal(root.get("userId"), userId.trim()));
            }
            if (StringUtils.hasText(farmId)) {
                predicates.add(cb.equal(root.get("farmId"), farmId.trim()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<EquipmentBooking> page = bookingRepository.findAll(spec, pageable);
        List<BookingResponse> content = page.getContent().stream()
                .map(mapper::toBookingResponse)
                .toList();

        return PagedResponse.<BookingResponse>builder()
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
    public List<BookingResponse> getBookingsForCalendar(LocalDateTime start, LocalDateTime end) {
        LocalDateTime queryStart = start != null ? start : LocalDateTime.now().minusMonths(1);
        LocalDateTime queryEnd = end != null ? end : LocalDateTime.now().plusMonths(3);

        return bookingRepository.findBookingsInCalendarRange(queryStart, queryEnd).stream()
                .map(mapper::toBookingResponse)
                .toList();
    }

    @Override
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public BookingResponse approveBooking(Long id, BookingDecisionRequest request) {
        EquipmentBooking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking request not found with ID: " + id));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BusinessRuleException("Only PENDING bookings can be approved. Current status is " + booking.getStatus());
        }

        Equipment equipment = booking.getEquipment();

        // Check if equipment status permits booking
        if (equipment.getStatus() == EquipmentStatus.UNDER_MAINTENANCE || 
            equipment.getStatus() == EquipmentStatus.OUT_OF_SERVICE || 
            equipment.getStatus() == EquipmentStatus.INACTIVE) {
            throw new BusinessRuleException("Cannot approve booking: Equipment is currently " + equipment.getStatus());
        }

        // Strict Concurrency & Overlap Re-check
        List<EquipmentBooking> conflicts = bookingRepository.findConflictingBookingsExcluding(
                equipment.getId(),
                booking.getId(),
                booking.getStartTime(),
                booking.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            EquipmentBooking c = conflicts.get(0);
            throw new ConflictException(String.format(
                    "Approval rejected due to overlap: Booking #%d is already approved for %s to %s.",
                    c.getId(), c.getStartTime(), c.getEndTime()
            ));
        }

        booking.setStatus(BookingStatus.APPROVED);
        if (request != null && StringUtils.hasText(request.getRemarks())) {
            booking.setApprovalRemarks(request.getRemarks().trim());
        }

        // Update equipment status if current date is within start time
        LocalDateTime now = LocalDateTime.now();
        if (booking.getStartTime().isBefore(now.plusHours(12))) {
            equipment.setStatus(EquipmentStatus.BOOKED);
            equipmentRepository.save(equipment);
        }

        EquipmentBooking saved = bookingRepository.save(booking);

        notificationService.createNotification(
                equipment,
                "Booking Approved",
                String.format("Booking request #%d for %s has been APPROVED. Work location: %s.",
                        saved.getId(), equipment.getName(), saved.getWorkLocation()),
                NotificationType.BOOKING_APPROVED,
                NotificationSeverity.SUCCESS
        );

        log.info("Booking ID {} approved successfully", id);
        return mapper.toBookingResponse(saved);
    }

    @Override
    @Transactional
    public BookingResponse rejectBooking(Long id, BookingDecisionRequest request) {
        EquipmentBooking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking request not found with ID: " + id));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BusinessRuleException("Only PENDING bookings can be rejected. Current status is " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.REJECTED);
        if (request != null && StringUtils.hasText(request.getRemarks())) {
            booking.setApprovalRemarks(request.getRemarks().trim());
        }

        EquipmentBooking saved = bookingRepository.save(booking);

        notificationService.createNotification(
                booking.getEquipment(),
                "Booking Request Rejected",
                String.format("Booking request #%d for %s was REJECTED. %s",
                        saved.getId(), booking.getEquipment().getName(),
                        StringUtils.hasText(saved.getApprovalRemarks()) ? "Remarks: " + saved.getApprovalRemarks() : ""),
                NotificationType.BOOKING_REJECTED,
                NotificationSeverity.WARNING
        );

        log.info("Booking ID {} rejected", id);
        return mapper.toBookingResponse(saved);
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(Long id, BookingDecisionRequest request) {
        EquipmentBooking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking request not found with ID: " + id));

        if (booking.getStatus() == BookingStatus.COMPLETED || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BusinessRuleException("Cannot cancel booking with status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CANCELLED);
        if (request != null && StringUtils.hasText(request.getRemarks())) {
            booking.setApprovalRemarks(request.getRemarks().trim());
        }

        // If equipment was in BOOKED state, check if other approved bookings exist; if not, restore AVAILABLE
        Equipment equipment = booking.getEquipment();
        if (equipment.getStatus() == EquipmentStatus.BOOKED) {
            List<EquipmentBooking> activeOther = bookingRepository.findConflictingBookingsExcluding(
                    equipment.getId(), booking.getId(), LocalDateTime.now(), LocalDateTime.now().plusYears(1)
            );
            if (activeOther.isEmpty()) {
                equipment.setStatus(EquipmentStatus.AVAILABLE);
                equipmentRepository.save(equipment);
            }
        }

        EquipmentBooking saved = bookingRepository.save(booking);
        log.info("Booking ID {} cancelled", id);
        return mapper.toBookingResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByEquipment(Long equipmentId) {
        return bookingRepository.findByEquipmentIdOrderByStartTimeDesc(equipmentId).stream()
                .map(mapper::toBookingResponse)
                .toList();
    }
}

