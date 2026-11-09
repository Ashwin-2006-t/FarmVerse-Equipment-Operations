package com.farmverse.equipment.repository;

import com.farmverse.equipment.entity.MaintenanceSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MaintenanceScheduleRepository extends JpaRepository<MaintenanceSchedule, Long> {

    List<MaintenanceSchedule> findByEquipmentIdAndIsActiveTrue(Long equipmentId);

    List<MaintenanceSchedule> findByIsActiveTrue();

    @Query("SELECT s FROM MaintenanceSchedule s WHERE s.isActive = true AND s.nextDueDate <= :cutoffDate")
    List<MaintenanceSchedule> findUpcomingByDate(@Param("cutoffDate") LocalDate cutoffDate);

    @Query("SELECT s FROM MaintenanceSchedule s WHERE s.isActive = true AND s.nextDueDate < :currentDate")
    List<MaintenanceSchedule> findOverdueByDate(@Param("currentDate") LocalDate currentDate);
}

