package com.farmverse.equipment.repository;

import com.farmverse.equipment.entity.EquipmentUsage;
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
import java.util.Optional;

@Repository
public interface UsageRepository extends JpaRepository<EquipmentUsage, Long>, JpaSpecificationExecutor<EquipmentUsage> {

    boolean existsByBookingId(Long bookingId);

    boolean existsByEquipmentId(Long equipmentId);

    List<EquipmentUsage> findByEquipmentIdOrderByUsageDateDesc(Long equipmentId);

    Optional<EquipmentUsage> findByBookingId(Long bookingId);

    @Query("SELECT COALESCE(SUM(u.fuelConsumedLitres), 0) FROM EquipmentUsage u")
    BigDecimal sumTotalFuelConsumed();

    @Query("SELECT COALESCE(SUM(u.totalUsageCost), 0) FROM EquipmentUsage u")
    BigDecimal sumTotalUsageCost();

    @Query("SELECT FUNCTION('TO_CHAR', u.usageDate, 'YYYY-MM') AS month, " +
           "SUM(u.totalOperatingHours), SUM(u.fuelConsumedLitres), SUM(u.totalUsageCost) " +
           "FROM EquipmentUsage u GROUP BY FUNCTION('TO_CHAR', u.usageDate, 'YYYY-MM') " +
           "ORDER BY month ASC")
    List<Object[]> getMonthlyUsageTrends();

    List<EquipmentUsage> findTop10ByOrderByCreatedAtDesc();
}

