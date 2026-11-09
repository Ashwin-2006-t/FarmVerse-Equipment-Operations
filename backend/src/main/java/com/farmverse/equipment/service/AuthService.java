package com.farmverse.equipment.service;

import com.farmverse.equipment.dto.request.LoginRequest;
import com.farmverse.equipment.dto.response.LoginResponse;
import com.farmverse.equipment.dto.response.UserProfileResponse;

public interface AuthService {

    LoginResponse login(LoginRequest request);

    UserProfileResponse getCurrentUserProfile();
}

