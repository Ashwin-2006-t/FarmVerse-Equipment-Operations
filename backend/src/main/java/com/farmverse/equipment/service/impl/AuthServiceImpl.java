package com.farmverse.equipment.service.impl;

import com.farmverse.equipment.dto.request.LoginRequest;
import com.farmverse.equipment.dto.response.LoginResponse;
import com.farmverse.equipment.dto.response.UserProfileResponse;
import com.farmverse.equipment.exception.UnauthorizedException;
import com.farmverse.equipment.security.CustomUserDetailsService;
import com.farmverse.equipment.security.JwtTokenProvider;
import com.farmverse.equipment.security.UserPrincipal;
import com.farmverse.equipment.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService userDetailsService;

    @Override
    public LoginResponse login(LoginRequest request) {
        log.info("Processing login request for identity: {}", request.getUsername());

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername().trim().toLowerCase(),
                            request.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            String jwt = tokenProvider.generateTokenFromUser(userPrincipal);

            log.info("Login successful for user: {} with role: {}", userPrincipal.getUsername(), userPrincipal.getRole());

            return LoginResponse.builder()
                    .token(jwt)
                    .tokenType("Bearer")
                    .userId(userPrincipal.getId())
                    .username(userPrincipal.getUsername())
                    .name(userPrincipal.getName())
                    .email(userPrincipal.getEmail())
                    .role(userPrincipal.getRole())
                    .organizationId(userPrincipal.getOrganizationId())
                    .farmId(userPrincipal.getFarmId())
                    .build();
        } catch (Exception ex) {
            log.warn("Authentication failed for user {}: {}", request.getUsername(), ex.getMessage());
            throw new UnauthorizedException("Invalid username or password credentials.");
        }
    }

    @Override
    public UserProfileResponse getCurrentUserProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal user)) {
            // Default development fallback
            return UserProfileResponse.builder()
                    .userId("USR-ADMIN-01")
                    .username("admin")
                    .name("Dr. Aravind Menon")
                    .email("admin@farmverse.com")
                    .role("ROLE_ADMIN")
                    .organizationId("ORG-FV-001")
                    .farmId("FARM-HQ-01")
                    .permissions(List.of("EQUIPMENT_READ", "EQUIPMENT_WRITE", "BOOKING_APPROVE", "MAINTENANCE_MANAGE"))
                    .build();
        }

        List<String> permissions = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        return UserProfileResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .organizationId(user.getOrganizationId())
                .farmId(user.getFarmId())
                .permissions(permissions)
                .build();
    }
}

