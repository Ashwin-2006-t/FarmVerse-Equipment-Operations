package com.farmverse.equipment.service;

import com.farmverse.equipment.dto.request.MaintenanceScheduleRequest;
import com.farmverse.equipment.dto.response.MaintenanceScheduleResponse;

import java.util.List;

public interface MaintenanceScheduleService {

    MaintenanceScheduleResponse createSchedule(MaintenanceScheduleRequest request);

    MaintenanceScheduleResponse updateSchedule(Long id, MaintenanceScheduleRequest request);

    MaintenanceScheduleResponse getScheduleById(Long id);

    List<MaintenanceScheduleResponse> getSchedulesByEquipment(Long equipmentId);

    List<MaintenanceScheduleResponse> getAllActiveSchedules();

    List<MaintenanceScheduleResponse> getUpcomingServices();

    List<MaintenanceScheduleResponse> getOverdueServices();

    void evaluateAutomatedAlerts();
}

