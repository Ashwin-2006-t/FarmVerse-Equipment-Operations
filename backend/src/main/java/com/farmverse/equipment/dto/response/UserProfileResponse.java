package com.farmverse.equipment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private String userId;
    private String username;
    private String name;
    private String email;
    private String role;
    private String organizationId;
    private String farmId;
    private List<String> permissions;
}

