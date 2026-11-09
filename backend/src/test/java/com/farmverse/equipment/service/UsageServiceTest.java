package com.farmverse.equipment.service;

import com.farmverse.equipment.dto.request.UsageCreateRequest;
import com.farmverse.equipment.dto.response.UsageResponse;
import com.farmverse.equipment.entity.Equipment;
import com.farmverse.equipment.entity.EquipmentBooking;
import com.farmverse.equipment.entity.EquipmentUsage;
import com.farmverse.equipment.enums.BookingStatus;
import com.farmverse.equipment.enums.EquipmentCategory;
import com.farmverse.equipment.enums.EquipmentStatus;
import com.farmverse.equipment.exception.BusinessRuleException;
import com.farmverse.equipment.exception.ConflictException;
import com.farmverse.equipment.mapper.EquipmentModelMapper;
import com.farmverse.equipment.repository.BookingRepository;
import com.farmverse.equipment.repository.EquipmentRepository;
import com.farmverse.equipment.repository.MaintenanceScheduleRepository;
import com.farmverse.equipment.repository.UsageRepository;
import com.farmverse.equipment.service.impl.UsageServiceImpl;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsageServiceTest {

    @Mock
    private UsageRepository usageRepository;

    @Mock
    private EquipmentRepository equipmentRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private MaintenanceScheduleRepository scheduleRepository;

    @Mock
    private NotificationService notificationService;

    @Spy
    private EquipmentModelMapper mapper = new EquipmentModelMapper();

    @InjectMocks
    private UsageServiceImpl usageService;

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
                .currentOperatingHours(new BigDecimal("480.00"))
                .fuelType("DIESEL")
                .fuelTankCapacity(new BigDecimal("68.00"))
                .equipmentCondition("EXCELLENT")
                .assignedFarmId("FARM-NORTH-01")
                .organizationId("ORG-FV-001")
                .status(EquipmentStatus.IN_USE)
                .isActive(true)
                .build();

        sampleBooking = EquipmentBooking.builder()
                .id(50L)
                .equipment(sampleEquipment)
                .userId("USR-FARMER-01")
                .userName("Ramesh Patel")
                .userRole("FARMER")
                .farmId("FARM-NORTH-01")
                .organizationId("ORG-FV-001")
                .startTime(LocalDateTime.now().minusDays(1))
                .endTime(LocalDateTime.now())
                .purpose("Ploughing")
                .workLocation("Field 4")
                .status(BookingStatus.APPROVED)
                .build();
    }

    @Test
    @DisplayName("Successfully records usage, computes operating hours and updates machinery hours")
    void testRecordUsage_Success() {
        UsageCreateRequest request = UsageCreateRequest.builder()
                .equipmentId(1L)
                .bookingId(50L)
                .farmId("FARM-NORTH-01")
                .usageDate(LocalDate.now())
                .startOperatingHours(new BigDecimal("480.00"))
                .endOperatingHours(new BigDecimal("490.50"))
                .fuelConsumedLitres(new BigDecimal("45.00"))
                .fuelCost(new BigDecimal("56.25"))
                .operatorDetails("Operator Ramesh")
                .workDescription("Heavy harrowing")
                .additionalExpenses(new BigDecimal("15.00"))
                .build();

        when(equipmentRepository.findById(1L)).thenReturn(Optional.of(sampleEquipment));
        when(usageRepository.existsByBookingId(50L)).thenReturn(false);
        when(bookingRepository.findById(50L)).thenReturn(Optional.of(sampleBooking));
        when(scheduleRepository.findByEquipmentIdAndIsActiveTrue(1L)).thenReturn(Collections.emptyList());
        when(usageRepository.save(any(EquipmentUsage.class))).thenAnswer(i -> {
            EquipmentUsage u = i.getArgument(0);
            u.setId(200L);
            return u;
        });

        UsageResponse response = usageService.recordUsage(request);

        assertNotNull(response);
        assertEquals(new BigDecimal("10.50"), response.getTotalOperatingHours());
        assertEquals(new BigDecimal("71.25"), response.getTotalUsageCost());
        assertEquals(new BigDecimal("490.50"), sampleEquipment.getCurrentOperatingHours());
        assertEquals(BookingStatus.COMPLETED, sampleBooking.getStatus());
        verify(equipmentRepository).save(sampleEquipment);
    }

    @Test
    @DisplayName("Fails when end operating hours is less than start operating hours")
    void testRecordUsage_InvalidOperatingHours_ThrowsBusinessRule() {
        UsageCreateRequest request = UsageCreateRequest.builder()
                .equipmentId(1L)
                .startOperatingHours(new BigDecimal("500.00"))
                .endOperatingHours(new BigDecimal("480.00"))
                .fuelConsumedLitres(new BigDecimal("10.00"))
                .build();

        assertThrows(BusinessRuleException.class, () -> usageService.recordUsage(request));
    }

    @Test
    @DisplayName("Fails when duplicate usage is submitted for an existing booking")
    void testRecordUsage_DuplicateBooking_ThrowsConflict() {
        UsageCreateRequest request = UsageCreateRequest.builder()
                .equipmentId(1L)
                .bookingId(50L)
                .startOperatingHours(new BigDecimal("480.00"))
                .endOperatingHours(new BigDecimal("490.00"))
                .fuelConsumedLitres(new BigDecimal("20.00"))
                .build();

        when(equipmentRepository.findById(1L)).thenReturn(Optional.of(sampleEquipment));
        when(usageRepository.existsByBookingId(50L)).thenReturn(true);

        assertThrows(ConflictException.class, () -> usageService.recordUsage(request));
    }
}

