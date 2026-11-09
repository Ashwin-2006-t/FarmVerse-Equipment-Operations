package com.farmverse.equipment;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class EquipmentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Context loads and Flyway migrations seed development data properly")
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testFlywayMigrationsAndDashboardSummary() throws Exception {
        mockMvc.perform(get("/api/equipment/dashboard")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalEquipment", greaterThanOrEqualTo(10)))
                .andExpect(jsonPath("$.availableEquipment", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.totalOperatingHours", notNullValue()))
                .andExpect(jsonPath("$.statusCounts.AVAILABLE", notNullValue()));
    }

    @Test
    @DisplayName("Retrieves equipment listing with pagination and search")
    @WithMockUser(username = "farmer", roles = {"FARMER"})
    void testEquipmentListing() throws Exception {
        mockMvc.perform(get("/api/equipment")
                        .param("page", "0")
                        .param("size", "5")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(lessThanOrEqualTo(5))))
                .andExpect(jsonPath("$.totalElements", greaterThanOrEqualTo(10)));
    }

    @Test
    @DisplayName("Farmer login authentication generates valid JWT token")
    void testAuthLogin() throws Exception {
        String loginPayload = """
                {
                    "username": "admin",
                    "password": "admin123"
                }
                """;

        mockMvc.perform(post("/api/equipment/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.role", is("ROLE_ADMIN")));
    }

    @Test
    @DisplayName("Retrieves equipment analytics utilization metrics")
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testUtilizationAnalytics() throws Exception {
        mockMvc.perform(get("/api/equipment/analytics/utilization")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.equipmentUtilization", not(empty())))
                .andExpect(jsonPath("$.categoryUtilization", not(empty())));
    }
}

