package com.farmverse.equipment.repository;

import com.farmverse.equipment.entity.MaintenanceRecord;
import com.farmverse.equipment.enums.MaintenanceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface MaintenanceRepository extends JpaRepository<MaintenanceRecord, Long>, JpaSpecificationExecutor<MaintenanceRecord> {

    boolean existsByEquipmentId(Long equipmentId);

    List<MaintenanceRecord> findByEquipmentIdOrderByServiceDateDesc(Long equipmentId);

    List<MaintenanceRecord> findByStatusIn(List<MaintenanceStatus> statuses);

    long countByStatus(MaintenanceStatus status);

    @Query("SELECT COALESCE(SUM(m.totalCost), 0) FROM MaintenanceRecord m")
    BigDecimal sumTotalMaintenanceCost();

    @Query("SELECT m.maintenanceType, COUNT(m), COALESCE(SUM(m.totalCost), 0) FROM MaintenanceRecord m GROUP BY m.maintenanceType")
    List<Object[]> getExpenditureByTypeAggregates();

    @Query("SELECT FUNCTION('TO_CHAR', m.serviceDate, 'YYYY-MM') AS month, " +
           "COUNT(m), SUM(m.labourCost), SUM(m.sparePartsCost), SUM(m.totalCost) " +
           "FROM MaintenanceRecord m GROUP BY FUNCTION('TO_CHAR', m.serviceDate, 'YYYY-MM') " +
           "ORDER BY month ASC")
    List<Object[]> getMonthlyExpenditureTrends();

    @Query("SELECT m FROM MaintenanceRecord m WHERE m.status IN ('SCHEDULED', 'IN_PROGRESS') ORDER BY m.serviceDate ASC")
    List<MaintenanceRecord> findUpcomingAndActiveMaintenance();

    List<MaintenanceRecord> findTop10ByOrderByCreatedAtDesc();
}

