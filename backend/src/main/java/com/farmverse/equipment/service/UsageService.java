package com.farmverse.equipment.service;

import com.farmverse.equipment.dto.request.UsageCreateRequest;
import com.farmverse.equipment.dto.response.PagedResponse;
import com.farmverse.equipment.dto.response.UsageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UsageService {

    UsageResponse recordUsage(UsageCreateRequest request);

    UsageResponse getUsageById(Long id);

    PagedResponse<UsageResponse> getAllUsage(Long equipmentId, String farmId, Pageable pageable);

    List<UsageResponse> getUsageByEquipment(Long equipmentId);
}

