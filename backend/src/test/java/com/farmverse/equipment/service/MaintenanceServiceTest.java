package com.farmverse.equipment.service;

import com.farmverse.equipment.dto.request.MaintenanceCreateRequest;
import com.farmverse.equipment.dto.request.MaintenanceUpdateRequest;
import com.farmverse.equipment.dto.response.MaintenanceResponse;
import com.farmverse.equipment.entity.Equipment;
import com.farmverse.equipment.entity.MaintenanceRecord;
import com.farmverse.equipment.enums.EquipmentCategory;
import com.farmverse.equipment.enums.EquipmentStatus;
import com.farmverse.equipment.enums.MaintenanceStatus;
import com.farmverse.equipment.enums.MaintenanceType;
import com.farmverse.equipment.mapper.EquipmentModelMapper;
import com.farmverse.equipment.repository.EquipmentRepository;
import com.farmverse.equipment.repository.MaintenanceRepository;
import com.farmverse.equipment.repository.MaintenanceScheduleRepository;
import com.farmverse.equipment.service.impl.MaintenanceServiceImpl;
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
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MaintenanceServiceTest {

    @Mock
    private MaintenanceRepository maintenanceRepository;

    @Mock
    private EquipmentRepository equipmentRepository;

    @Mock
    private MaintenanceScheduleRepository scheduleRepository;

    @Mock
    private NotificationService notificationService;

    @Spy
    private EquipmentModelMapper mapper = new EquipmentModelMapper();

    @InjectMocks
    private MaintenanceServiceImpl maintenanceService;

    private Equipment sampleEquipment;

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
    }

    @Test
    @DisplayName("Successfully creates breakdown repair and updates equipment to UNDER_MAINTENANCE")
    void testCreateMaintenanceRecord_Breakdown_SetsUnderMaintenance() {
        MaintenanceCreateRequest request = MaintenanceCreateRequest.builder()
                .equipmentId(1L)
                .maintenanceType(MaintenanceType.BREAKDOWN_REPAIR)
                .description("Engine cylinder gasket blowout")
                .serviceDate(LocalDate.now())
                .serviceProvider("AgriRepair Co")
                .technicianName("Anand Kumar")
                .labourCost(new BigDecimal("150.00"))
                .sparePartsCost(new BigDecimal("300.00"))
                .additionalCost(new BigDecimal("20.00"))
                .previousOperatingHours(new BigDecimal("480.50"))
                .status(MaintenanceStatus.IN_PROGRESS)
                .build();

        when(equipmentRepository.findById(1L)).thenReturn(Optional.of(sampleEquipment));
        when(maintenanceRepository.save(any(MaintenanceRecord.class))).thenAnswer(i -> {
            MaintenanceRecord m = i.getArgument(0);
            m.setId(500L);
            return m;
        });

        MaintenanceResponse response = maintenanceService.createMaintenanceRecord(request);

        assertNotNull(response);
        assertEquals(500L, response.getId());
        assertEquals(new BigDecimal("470.00"), response.getTotalCost());
        assertEquals(EquipmentStatus.UNDER_MAINTENANCE, sampleEquipment.getStatus());
        verify(equipmentRepository).save(sampleEquipment);
        verify(notificationService).createNotification(eq(sampleEquipment), anyString(), anyString(), any(), any());
    }

    @Test
    @DisplayName("Updating maintenance to COMPLETED returns equipment to AVAILABLE when no other maintenance is active")
    void testUpdateMaintenanceRecord_Completed_SetsEquipmentAvailable() {
        sampleEquipment.setStatus(EquipmentStatus.UNDER_MAINTENANCE);

        MaintenanceRecord record = MaintenanceRecord.builder()
                .id(500L)
                .equipment(sampleEquipment)
                .maintenanceType(MaintenanceType.REGULAR_SERVICING)
                .description("Routine servicing")
                .serviceDate(LocalDate.now())
                .serviceProvider("AgriRepair")
                .technicianName("Anand")
                .labourCost(new BigDecimal("100.00"))
                .sparePartsCost(new BigDecimal("100.00"))
                .additionalCost(BigDecimal.ZERO)
                .totalCost(new BigDecimal("200.00"))
                .previousOperatingHours(new BigDecimal("480.00"))
                .status(MaintenanceStatus.IN_PROGRESS)
                .build();

        when(maintenanceRepository.findById(500L)).thenReturn(Optional.of(record));
        when(maintenanceRepository.findByEquipmentIdOrderByServiceDateDesc(1L)).thenReturn(Collections.singletonList(record));
        when(scheduleRepository.findByEquipmentIdAndIsActiveTrue(1L)).thenReturn(Collections.emptyList());
        when(maintenanceRepository.save(any(MaintenanceRecord.class))).thenReturn(record);

        MaintenanceUpdateRequest updateRequest = MaintenanceUpdateRequest.builder()
                .maintenanceType(MaintenanceType.REGULAR_SERVICING)
                .description("Routine servicing complete")
                .serviceDate(LocalDate.now())
                .serviceProvider("AgriRepair")
                .technicianName("Anand")
                .labourCost(new BigDecimal("100.00"))
                .sparePartsCost(new BigDecimal("100.00"))
                .additionalCost(BigDecimal.ZERO)
                .previousOperatingHours(new BigDecimal("480.00"))
                .status(MaintenanceStatus.COMPLETED)
                .build();

        MaintenanceResponse response = maintenanceService.updateMaintenanceRecord(500L, updateRequest);

        assertNotNull(response);
        assertEquals(MaintenanceStatus.COMPLETED, response.getStatus());
        assertEquals(EquipmentStatus.AVAILABLE, sampleEquipment.getStatus());
        verify(equipmentRepository).save(sampleEquipment);
    }
}

