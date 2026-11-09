package com.farmverse.equipment.service.impl;

import com.farmverse.equipment.dto.request.EquipmentCreateRequest;
import com.farmverse.equipment.dto.request.EquipmentStatusUpdateRequest;
import com.farmverse.equipment.dto.request.EquipmentUpdateRequest;
import com.farmverse.equipment.dto.response.EquipmentResponse;
import com.farmverse.equipment.dto.response.PagedResponse;
import com.farmverse.equipment.entity.Equipment;
import com.farmverse.equipment.entity.MaintenanceRecord;
import com.farmverse.equipment.enums.BookingStatus;
import com.farmverse.equipment.enums.EquipmentCategory;
import com.farmverse.equipment.enums.EquipmentStatus;
import com.farmverse.equipment.enums.MaintenanceStatus;
import com.farmverse.equipment.enums.NotificationSeverity;
import com.farmverse.equipment.enums.NotificationType;
import com.farmverse.equipment.exception.BusinessRuleException;
import com.farmverse.equipment.exception.ConflictException;
import com.farmverse.equipment.exception.ResourceNotFoundException;
import com.farmverse.equipment.mapper.EquipmentModelMapper;
import com.farmverse.equipment.repository.BookingRepository;
import com.farmverse.equipment.repository.EquipmentRepository;
import com.farmverse.equipment.repository.MaintenanceRepository;
import com.farmverse.equipment.repository.UsageRepository;
import com.farmverse.equipment.service.EquipmentService;
import com.farmverse.equipment.service.NotificationService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EquipmentServiceImpl implements EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final UsageRepository usageRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final NotificationService notificationService;
    private final EquipmentModelMapper mapper;

    @Override
    @Transactional
    public EquipmentResponse createEquipment(EquipmentCreateRequest request) {
        log.info("Registering new equipment: {}", request.getName());

        if (equipmentRepository.existsByRegistrationNumberIgnoreCase(request.getRegistrationNumber())) {
            throw new ConflictException("Equipment with registration number '" + request.getRegistrationNumber() + "' already exists.");
        }
        if (equipmentRepository.existsBySerialNumberIgnoreCase(request.getSerialNumber())) {
            throw new ConflictException("Equipment with serial number '" + request.getSerialNumber() + "' already exists.");
        }

        Equipment equipment = Equipment.builder()
                .name(request.getName().trim())
                .category(request.getCategory())
                .brand(request.getBrand().trim())
                .model(request.getModel().trim())
                .registrationNumber(request.getRegistrationNumber().trim().toUpperCase())
                .serialNumber(request.getSerialNumber().trim().toUpperCase())
                .purchaseDate(request.getPurchaseDate())
                .purchaseCost(request.getPurchaseCost())
                .currentOperatingHours(request.getCurrentOperatingHours())
                .fuelType(request.getFuelType().trim())
                .fuelTankCapacity(request.getFuelTankCapacity())
                .equipmentCondition(request.getEquipmentCondition().trim())
                .assignedFarmId(request.getAssignedFarmId().trim())
                .organizationId(request.getOrganizationId() != null ? request.getOrganizationId().trim() : "ORG-FV-001")
                .description(request.getDescription())
                .imageUrl(StringUtils.hasText(request.getImageUrl()) ? request.getImageUrl() : 
                        "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80")
                .status(EquipmentStatus.AVAILABLE)
                .isActive(true)
                .build();

        Equipment saved = equipmentRepository.save(equipment);
        log.info("Equipment registered successfully with ID: {}", saved.getId());
        return mapper.toEquipmentResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public EquipmentResponse getEquipmentById(Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + id));
        return mapper.toEquipmentResponse(equipment);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<EquipmentResponse> getAllEquipment(String search,
                                                            EquipmentCategory category,
                                                            EquipmentStatus status,
                                                            String farmId,
                                                            Pageable pageable) {
        Specification<Equipment> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(search)) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), pattern);
                Predicate regMatch = cb.like(cb.lower(root.get("registrationNumber")), pattern);
                Predicate brandMatch = cb.like(cb.lower(root.get("brand")), pattern);
                Predicate modelMatch = cb.like(cb.lower(root.get("model")), pattern);
                predicates.add(cb.or(nameMatch, regMatch, brandMatch, modelMatch));
            }

            if (category != null) {
                predicates.add(cb.equal(root.get("category"), category));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (StringUtils.hasText(farmId)) {
                predicates.add(cb.equal(root.get("assignedFarmId"), farmId.trim()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Equipment> page = equipmentRepository.findAll(spec, pageable);
        List<EquipmentResponse> content = page.getContent().stream()
                .map(mapper::toEquipmentResponse)
                .toList();

        return PagedResponse.<EquipmentResponse>builder()
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
    public List<EquipmentResponse> getAllActiveEquipment() {
        return equipmentRepository.findByIsActiveTrue().stream()
                .map(mapper::toEquipmentResponse)
                .toList();
    }

    @Override
    @Transactional
    public EquipmentResponse updateEquipment(Long id, EquipmentUpdateRequest request) {
        log.info("Updating equipment with ID: {}", id);
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + id));

        if (equipmentRepository.existsByRegistrationNumberIgnoreCaseAndIdNot(request.getRegistrationNumber(), id)) {
            throw new ConflictException("Another equipment with registration number '" + request.getRegistrationNumber() + "' already exists.");
        }
        if (equipmentRepository.existsBySerialNumberIgnoreCaseAndIdNot(request.getSerialNumber(), id)) {
            throw new ConflictException("Another equipment with serial number '" + request.getSerialNumber() + "' already exists.");
        }

        equipment.setName(request.getName().trim());
        equipment.setCategory(request.getCategory());
        equipment.setBrand(request.getBrand().trim());
        equipment.setModel(request.getModel().trim());
        equipment.setRegistrationNumber(request.getRegistrationNumber().trim().toUpperCase());
        equipment.setSerialNumber(request.getSerialNumber().trim().toUpperCase());
        equipment.setPurchaseDate(request.getPurchaseDate());
        equipment.setPurchaseCost(request.getPurchaseCost());
        equipment.setCurrentOperatingHours(request.getCurrentOperatingHours());
        equipment.setFuelType(request.getFuelType().trim());
        equipment.setFuelTankCapacity(request.getFuelTankCapacity());
        equipment.setEquipmentCondition(request.getEquipmentCondition().trim());
        equipment.setAssignedFarmId(request.getAssignedFarmId().trim());
        equipment.setDescription(request.getDescription());
        if (StringUtils.hasText(request.getImageUrl())) {
            equipment.setImageUrl(request.getImageUrl());
        }

        Equipment updated = equipmentRepository.save(equipment);
        log.info("Equipment ID {} updated successfully", id);
        return mapper.toEquipmentResponse(updated);
    }

    @Override
    @Transactional
    public EquipmentResponse updateEquipmentStatus(Long id, EquipmentStatusUpdateRequest request) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + id));

        EquipmentStatus targetStatus = request.getStatus();
        log.info("Requesting status change for Equipment {} from {} to {}", id, equipment.getStatus(), targetStatus);

        // Rule: Cannot mark AVAILABLE if active maintenance is currently IN_PROGRESS
        if (targetStatus == EquipmentStatus.AVAILABLE) {
            List<MaintenanceRecord> activeMaintenance = maintenanceRepository.findByEquipmentIdOrderByServiceDateDesc(id)
                    .stream()
                    .filter(m -> m.getStatus() == MaintenanceStatus.IN_PROGRESS || m.getStatus() == MaintenanceStatus.SCHEDULED)
                    .toList();
            if (!activeMaintenance.isEmpty()) {
                throw new BusinessRuleException("Cannot mark equipment AVAILABLE while maintenance (" + 
                        activeMaintenance.get(0).getMaintenanceType() + ") is still " + activeMaintenance.get(0).getStatus());
            }
        }

        equipment.setStatus(targetStatus);
        if (targetStatus == EquipmentStatus.INACTIVE) {
            equipment.setIsActive(false);
        } else {
            equipment.setIsActive(true);
        }

        if (targetStatus == EquipmentStatus.OUT_OF_SERVICE) {
            notificationService.createNotification(
                    equipment,
                    "Equipment Out of Service",
                    "Equipment " + equipment.getName() + " (" + equipment.getRegistrationNumber() + ") marked OUT_OF_SERVICE. " +
                            (StringUtils.hasText(request.getRemarks()) ? "Remarks: " + request.getRemarks() : ""),
                    NotificationType.BREAKDOWN_REPORTED,
                    NotificationSeverity.ERROR
            );
        }

        Equipment updated = equipmentRepository.save(equipment);
        return mapper.toEquipmentResponse(updated);
    }

    @Override
    @Transactional
    public void deactivateEquipment(Long id) {
        log.info("Deactivating equipment ID: {}", id);
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + id));

        equipment.setIsActive(false);
        equipment.setStatus(EquipmentStatus.INACTIVE);
        equipmentRepository.save(equipment);
        log.info("Equipment ID {} deactivated successfully", id);
    }

    @Override
    @Transactional
    public void deleteEquipment(Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + id));

        // Strict business rule: Do not permanently delete equipment that has booking, usage or maintenance history
        boolean hasBookings = bookingRepository.existsByEquipmentId(id);
        boolean hasUsage = usageRepository.existsByEquipmentId(id);
        boolean hasMaintenance = maintenanceRepository.existsByEquipmentId(id);

        if (hasBookings || hasUsage || hasMaintenance) {
            throw new BusinessRuleException("Equipment cannot be permanently deleted because historical operational records exist. Please deactivate it instead.");
        }

        equipmentRepository.delete(equipment);
        log.info("Equipment ID {} deleted permanently", id);
    }
}

