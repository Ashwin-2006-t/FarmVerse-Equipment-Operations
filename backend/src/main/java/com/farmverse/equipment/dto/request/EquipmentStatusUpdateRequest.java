package com.farmverse.equipment.dto.request;

import com.farmverse.equipment.enums.EquipmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentStatusUpdateRequest {

    @NotNull(message = "Equipment status is required")
    private EquipmentStatus status;

    private String remarks;
}

