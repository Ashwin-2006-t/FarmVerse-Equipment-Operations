package com.farmverse.equipment.service;

import com.farmverse.equipment.dto.request.MaintenanceCreateRequest;
import com.farmverse.equipment.dto.request.MaintenanceUpdateRequest;
import com.farmverse.equipment.dto.response.MaintenanceResponse;
import com.farmverse.equipment.dto.response.PagedResponse;
import com.farmverse.equipment.enums.MaintenanceStatus;
import com.farmverse.equipment.enums.MaintenanceType;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MaintenanceService {

    MaintenanceResponse createMaintenanceRecord(MaintenanceCreateRequest request);

    MaintenanceResponse updateMaintenanceRecord(Long id, MaintenanceUpdateRequest request);

    MaintenanceResponse getMaintenanceById(Long id);

    PagedResponse<MaintenanceResponse> getAllMaintenance(Long equipmentId,
                                                          MaintenanceStatus status,
                                                          MaintenanceType type,
                                                          Pageable pageable);

    List<MaintenanceResponse> getMaintenanceByEquipment(Long equipmentId);

    List<MaintenanceResponse> getActiveMaintenance();
}

