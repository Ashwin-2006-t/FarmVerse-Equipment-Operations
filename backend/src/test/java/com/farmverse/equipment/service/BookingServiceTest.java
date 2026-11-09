package com.farmverse.equipment.service;

import com.farmverse.equipment.dto.request.BookingCreateRequest;
import com.farmverse.equipment.dto.request.BookingDecisionRequest;
import com.farmverse.equipment.dto.response.BookingResponse;
import com.farmverse.equipment.entity.Equipment;
import com.farmverse.equipment.entity.EquipmentBooking;
import com.farmverse.equipment.enums.BookingStatus;
import com.farmverse.equipment.enums.EquipmentCategory;
import com.farmverse.equipment.enums.EquipmentStatus;
import com.farmverse.equipment.exception.BusinessRuleException;
import com.farmverse.equipment.exception.ConflictException;
import com.farmverse.equipment.mapper.EquipmentModelMapper;
import com.farmverse.equipment.repository.BookingRepository;
import com.farmverse.equipment.repository.EquipmentRepository;
import com.farmverse.equipment.service.impl.BookingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private EquipmentRepository equipmentRepository;

    @Mock
    private NotificationService notificationService;

    @Spy
    private EquipmentModelMapper mapper = new EquipmentModelMapper();

    @InjectMocks
    private BookingServiceImpl bookingService;

    private Equipment sampleEquipment;
    private EquipmentBooking sampleBooking;

    @BeforeEach
    void setUp() {
        sampleEquipment = Equipment.builder()
                .id(1L)
                .name("John Deere 5075E")
                .category(EquipmentCategory.TRACTORS)
                .brand("John Deere")
                .model("5075E")
                .registrationNumber("AG-TRAC-2024-001")
                .serialNumber("JD5075E-SN882910")
                .purchaseDate(LocalDate.of(2023, 3, 15))
                .purchaseCost(new BigDecimal("38500.00"))
                .currentOperatingHours(new BigDecimal("480.50"))
                .fuelType("DIESEL")
                .fuelTankCapacity(new BigDecimal("68.00"))
                .equipmentCondition("EXCELLENT")
                .assignedFarmId("FARM-NORTH-01")
                .organizationId("ORG-FV-001")
                .status(EquipmentStatus.AVAILABLE)
                .isActive(true)
                .build();

        sampleBooking = EquipmentBooking.builder()
                .id(100L)
                .equipment(sampleEquipment)
                .userId("USR-FARMER-01")
                .userName("Ramesh Patel")
                .userRole("FARMER")
                .farmId("FARM-NORTH-01")
                .organizationId("ORG-FV-001")
                .startTime(LocalDateTime.now().plusDays(2))
                .endTime(LocalDateTime.now().plusDays(4))
                .purpose("Tillage")
                .workLocation("Field 3")
                .status(BookingStatus.PENDING)
                .build();
    }

    @Test
    @DisplayName("Successfully creates booking request when no conflict exists")
    void testCreateBooking_Success() {
        BookingCreateRequest request = BookingCreateRequest.builder()
                .equipmentId(1L)
                .startTime(LocalDateTime.now().plusDays(2))
                .endTime(LocalDateTime.now().plusDays(4))
                .purpose("Primary tillage")
                .workLocation("Field Plot 3A")
                .farmId("FARM-NORTH-01")
                .organizationId("ORG-FV-001")
                .build();

        when(equipmentRepository.findById(1L)).thenReturn(Optional.of(sampleEquipment));
        when(bookingRepository.findConflictingBookings(eq(1L), any(), any())).thenReturn(Collections.emptyList());
        when(bookingRepository.save(any(EquipmentBooking.class))).thenAnswer(i -> {
            EquipmentBooking b = i.getArgument(0);
            b.setId(101L);
            return b;
        });

        BookingResponse response = bookingService.createBooking(request);

        assertNotNull(response);
        assertEquals(101L, response.getId());
        assertEquals(BookingStatus.PENDING, response.getStatus());
        verify(bookingRepository, times(1)).save(any(EquipmentBooking.class));
    }

    @Test
    @DisplayName("Prevents double booking when conflicting approved booking overlaps")
    void testCreateBooking_OverlappingSchedule_ThrowsConflictException() {
        BookingCreateRequest request = BookingCreateRequest.builder()
                .equipmentId(1L)
                .startTime(LocalDateTime.now().plusDays(2))
                .endTime(LocalDateTime.now().plusDays(4))
                .purpose("Secondary tillage")
                .workLocation("Field Plot 3A")
                .farmId("FARM-NORTH-01")
                .build();

        when(equipmentRepository.findById(1L)).thenReturn(Optional.of(sampleEquipment));

        EquipmentBooking existingBooking = EquipmentBooking.builder()
                .id(99L)
                .equipment(sampleEquipment)
                .startTime(LocalDateTime.now().plusDays(1))
                .endTime(LocalDateTime.now().plusDays(3))
                .status(BookingStatus.APPROVED)
                .build();

        when(bookingRepository.findConflictingBookings(eq(1L), any(), any())).thenReturn(List.of(existingBooking));

        assertThrows(ConflictException.class, () -> bookingService.createBooking(request));
        verify(bookingRepository, never()).save(any(EquipmentBooking.class));
    }

    @Test
    @DisplayName("Prevents booking equipment under active maintenance")
    void testCreateBooking_UnderMaintenance_ThrowsBusinessRule() {
        sampleEquipment.setStatus(EquipmentStatus.UNDER_MAINTENANCE);
        when(equipmentRepository.findById(1L)).thenReturn(Optional.of(sampleEquipment));

        BookingCreateRequest request = BookingCreateRequest.builder()
                .equipmentId(1L)
                .startTime(LocalDateTime.now().plusDays(2))
                .endTime(LocalDateTime.now().plusDays(3))
                .purpose("Tillage")
                .workLocation("Field 1")
                .farmId("FARM-01")
                .build();

        assertThrows(BusinessRuleException.class, () -> bookingService.createBooking(request));
    }

    @Test
    @DisplayName("Validates that end time cannot be before start time")
    void testCreateBooking_InvalidDates_ThrowsBusinessRule() {
        BookingCreateRequest request = BookingCreateRequest.builder()
                .equipmentId(1L)
                .startTime(LocalDateTime.now().plusDays(5))
                .endTime(LocalDateTime.now().plusDays(2))
                .purpose("Invalid dates")
                .workLocation("Field 1")
                .farmId("FARM-01")
                .build();

        assertThrows(BusinessRuleException.class, () -> bookingService.createBooking(request));
    }

    @Test
    @DisplayName("Admin successfully approves pending booking")
    void testApproveBooking_Success() {
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(sampleBooking));
        when(bookingRepository.findConflictingBookingsExcluding(eq(1L), eq(100L), any(), any())).thenReturn(Collections.emptyList());
        when(bookingRepository.save(any(EquipmentBooking.class))).thenReturn(sampleBooking);

        BookingDecisionRequest decision = BookingDecisionRequest.builder().remarks("Approved for duty").build();
        BookingResponse response = bookingService.approveBooking(100L, decision);

        assertNotNull(response);
        assertEquals(BookingStatus.APPROVED, response.getStatus());
        assertEquals("Approved for duty", response.getApprovalRemarks());
    }

    @Test
    @DisplayName("Admin successfully rejects pending booking with remarks")
    void testRejectBooking_Success() {
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(sampleBooking));
        when(bookingRepository.save(any(EquipmentBooking.class))).thenReturn(sampleBooking);

        BookingDecisionRequest decision = BookingDecisionRequest.builder().remarks("Rejected due to seasonal rest").build();
        BookingResponse response = bookingService.rejectBooking(100L, decision);

        assertNotNull(response);
        assertEquals(BookingStatus.REJECTED, response.getStatus());
    }
}

