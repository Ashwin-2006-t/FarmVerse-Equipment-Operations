package com.farmverse.equipment.security;

import com.farmverse.equipment.enums.Role;
import jakarta.annotation.PostConstruct;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final PasswordEncoder passwordEncoder;
    private final Map<String, UserPrincipal> users = new ConcurrentHashMap<>();

    public CustomUserDetailsService(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void initDevUsers() {
        // Test User 1: Administrator
        users.put("admin", UserPrincipal.create(
                "USR-ADMIN-01",
                "admin",
                passwordEncoder.encode("admin123"),
                "Dr. Aravind Menon",
                "admin@farmverse.com",
                Role.ROLE_ADMIN.name(),
                "ORG-FV-001",
                "FARM-HQ-01"
        ));
        users.put("admin@farmverse.com", users.get("admin"));

        // Test User 2: Farmer (Standard User)
        users.put("farmer", UserPrincipal.create(
                "USR-FARMER-01",
                "farmer",
                passwordEncoder.encode("farmer123"),
                "Ramesh Patel",
                "farmer@farmverse.com",
                Role.ROLE_FARMER.name(),
                "ORG-FV-001",
                "FARM-SOUTH-02"
        ));
        users.put("farmer@farmverse.com", users.get("farmer"));

        // Test User 3: Technician / Field Engineer
        users.put("technician", UserPrincipal.create(
                "USR-TECH-01",
                "technician",
                passwordEncoder.encode("tech123"),
                "Rajesh Nair",
                "tech@farmverse.com",
                Role.ROLE_TECHNICIAN.name(),
                "ORG-FV-001",
                "FARM-NORTH-01"
        ));
        users.put("tech@farmverse.com", users.get("technician"));
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserPrincipal user = users.get(username.trim().toLowerCase());
        if (user == null) {
            throw new UsernameNotFoundException("User not found with username or email: " + username);
        }
        return user;
    }

    public UserPrincipal findByUsernameOrEmail(String identifier) {
        return users.get(identifier.trim().toLowerCase());
    }
}

