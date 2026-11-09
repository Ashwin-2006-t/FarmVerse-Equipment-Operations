package com.farmverse.equipment.service;

import com.farmverse.equipment.dto.request.EquipmentCreateRequest;
import com.farmverse.equipment.dto.request.EquipmentStatusUpdateRequest;
import com.farmverse.equipment.dto.request.EquipmentUpdateRequest;
import com.farmverse.equipment.dto.response.EquipmentResponse;
import com.farmverse.equipment.entity.Equipment;
import com.farmverse.equipment.enums.EquipmentCategory;
import com.farmverse.equipment.enums.EquipmentStatus;
import com.farmverse.equipment.exception.BusinessRuleException;
import com.farmverse.equipment.exception.ConflictException;
import com.farmverse.equipment.exception.ResourceNotFoundException;
import com.farmverse.equipment.mapper.EquipmentModelMapper;
import com.farmverse.equipment.repository.BookingRepository;
import com.farmverse.equipment.repository.EquipmentRepository;
import com.farmverse.equipment.repository.MaintenanceRepository;
import com.farmverse.equipment.repository.UsageRepository;
import com.farmverse.equipment.service.impl.EquipmentServiceImpl;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EquipmentServiceTest {

    @Mock
    private EquipmentRepository equipmentRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UsageRepository usageRepository;

    @Mock
    private MaintenanceRepository maintenanceRepository;

    @Mock
    private NotificationService notificationService;

    @Spy
    private EquipmentModelMapper mapper = new EquipmentModelMapper();

    @InjectMocks
    private EquipmentServiceImpl equipmentService;

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
    @DisplayName("Successfully registers new agricultural equipment")
    void testCreateEquipment_Success() {
        EquipmentCreateRequest request = EquipmentCreateRequest.builder()
                .name("Mahindra 575 DI")
                .category(EquipmentCategory.TRACTORS)
                .brand("Mahindra")
                .model("575 DI")
                .registrationNumber("AG-TRAC-2024-999")
                .serialNumber("MH575-SN999")
                .purchaseDate(LocalDate.now())
                .purchaseCost(new BigDecimal("18000.00"))
                .currentOperatingHours(BigDecimal.ZERO)
                .fuelType("DIESEL")
                .fuelTankCapacity(new BigDecimal("50.00"))
                .equipmentCondition("NEW")
                .assignedFarmId("FARM-01")
                .organizationId("ORG-FV-001")
                .build();

        when(equipmentRepository.existsByRegistrationNumberIgnoreCase(request.getRegistrationNumber())).thenReturn(false);
        when(equipmentRepository.existsBySerialNumberIgnoreCase(request.getSerialNumber())).thenReturn(false);
        when(equipmentRepository.save(any(Equipment.class))).thenAnswer(i -> {
            Equipment e = i.getArgument(0);
            e.setId(10L);
            return e;
        });

        EquipmentResponse response = equipmentService.createEquipment(request);

        assertNotNull(response);
        assertEquals("Mahindra 575 DI", response.getName());
        assertEquals(EquipmentStatus.AVAILABLE, response.getStatus());
        verify(equipmentRepository, times(1)).save(any(Equipment.class));
    }

    @Test
    @DisplayName("Fails to register equipment with duplicate registration number")
    void testCreateEquipment_DuplicateRegistrationNumber_ThrowsConflict() {
        EquipmentCreateRequest request = EquipmentCreateRequest.builder()
                .registrationNumber("AG-TRAC-2024-001")
                .serialNumber("NEW-SERIAL")
                .build();

        when(equipmentRepository.existsByRegistrationNumberIgnoreCase("AG-TRAC-2024-001")).thenReturn(true);

        assertThrows(ConflictException.class, () -> equipmentService.createEquipment(request));
        verify(equipmentRepository, never()).save(any(Equipment.class));
    }

    @Test
    @DisplayName("Retrieves equipment by ID successfully")
    void testGetEquipmentById_Success() {
        when(equipmentRepository.findById(1L)).thenReturn(Optional.of(sampleEquipment));

        EquipmentResponse response = equipmentService.getEquipmentById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("John Deere 5075E", response.getName());
    }

    @Test
    @DisplayName("Throws ResourceNotFoundException when equipment ID does not exist")
    void testGetEquipmentById_NotFound() {
        when(equipmentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> equipmentService.getEquipmentById(999L));
    }

    @Test
    @DisplayName("Updates equipment information successfully")
    void testUpdateEquipment_Success() {
        when(equipmentRepository.findById(1L)).thenReturn(Optional.of(sampleEquipment));
        when(equipmentRepository.existsByRegistrationNumberIgnoreCaseAndIdNot(anyString(), anyLong())).thenReturn(false);
        when(equipmentRepository.existsBySerialNumberIgnoreCaseAndIdNot(anyString(), anyLong())).thenReturn(false);
        when(equipmentRepository.save(any(Equipment.class))).thenReturn(sampleEquipment);

        EquipmentUpdateRequest updateRequest = EquipmentUpdateRequest.builder()
                .name("John Deere 5075E Updated")
                .category(EquipmentCategory.TRACTORS)
                .brand("John Deere")
                .model("5075E 4WD")
                .registrationNumber("AG-TRAC-2024-001")
                .serialNumber("JD5075E-SN882910")
                .purchaseDate(LocalDate.of(2023, 3, 15))
                .purchaseCost(new BigDecimal("39000.00"))
                .currentOperatingHours(new BigDecimal("500.00"))
                .fuelType("DIESEL")
                .fuelTankCapacity(new BigDecimal("68.00"))
                .equipmentCondition("VERY_GOOD")
                .assignedFarmId("FARM-NORTH-01")
                .build();

        EquipmentResponse response = equipmentService.updateEquipment(1L, updateRequest);

        assertNotNull(response);
        assertEquals("John Deere 5075E Updated", response.getName());
    }

    @Test
    @DisplayName("Prevents permanent deletion of equipment with operational history and deactivates instead")
    void testDeleteEquipment_WithHistory_ThrowsBusinessRule() {
        when(equipmentRepository.findById(1L)).thenReturn(Optional.of(sampleEquipment));
        when(bookingRepository.existsByEquipmentId(1L)).thenReturn(true);

        assertThrows(BusinessRuleException.class, () -> equipmentService.deleteEquipment(1L));
        verify(equipmentRepository, never()).delete(any(Equipment.class));
    }
}

