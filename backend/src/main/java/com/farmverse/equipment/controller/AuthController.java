package com.farmverse.equipment.controller;

import com.farmverse.equipment.dto.request.LoginRequest;
import com.farmverse.equipment.dto.response.LoginResponse;
import com.farmverse.equipment.dto.response.UserProfileResponse;
import com.farmverse.equipment.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/equipment/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication & Identity", description = "Endpoints for JWT authentication, user profile and role verification")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Authenticate user credentials and obtain JWT Bearer token")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile context")
    public ResponseEntity<UserProfileResponse> getCurrentUser() {
        return ResponseEntity.ok(authService.getCurrentUserProfile());
    }
}

