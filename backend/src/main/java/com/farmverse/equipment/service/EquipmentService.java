package com.farmverse.equipment.service;

import com.farmverse.equipment.dto.request.EquipmentCreateRequest;
import com.farmverse.equipment.dto.request.EquipmentStatusUpdateRequest;
import com.farmverse.equipment.dto.request.EquipmentUpdateRequest;
import com.farmverse.equipment.dto.response.EquipmentResponse;
import com.farmverse.equipment.dto.response.PagedResponse;
import com.farmverse.equipment.enums.EquipmentCategory;
import com.farmverse.equipment.enums.EquipmentStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface EquipmentService {

    EquipmentResponse createEquipment(EquipmentCreateRequest request);

    EquipmentResponse getEquipmentById(Long id);

    PagedResponse<EquipmentResponse> getAllEquipment(String search,
                                                     EquipmentCategory category,
                                                     EquipmentStatus status,
                                                     String farmId,
                                                     Pageable pageable);

    List<EquipmentResponse> getAllActiveEquipment();

    EquipmentResponse updateEquipment(Long id, EquipmentUpdateRequest request);

    EquipmentResponse updateEquipmentStatus(Long id, EquipmentStatusUpdateRequest request);

    void deactivateEquipment(Long id);

    void deleteEquipment(Long id);
}

