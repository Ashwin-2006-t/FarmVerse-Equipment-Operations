package com.farmverse.equipment.repository;

import com.farmverse.equipment.entity.Equipment;
import com.farmverse.equipment.enums.EquipmentCategory;
import com.farmverse.equipment.enums.EquipmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long>, JpaSpecificationExecutor<Equipment> {

    Optional<Equipment> findByRegistrationNumberIgnoreCase(String registrationNumber);

    Optional<Equipment> findBySerialNumberIgnoreCase(String serialNumber);

    boolean existsByRegistrationNumberIgnoreCase(String registrationNumber);

    boolean existsBySerialNumberIgnoreCase(String serialNumber);

    boolean existsByRegistrationNumberIgnoreCaseAndIdNot(String registrationNumber, Long id);

    boolean existsBySerialNumberIgnoreCaseAndIdNot(String serialNumber, Long id);

    List<Equipment> findByIsActiveTrue();

    List<Equipment> findByStatusAndIsActiveTrue(EquipmentStatus status);

    long countByStatus(EquipmentStatus status);

    long countByIsActiveTrue();

    @Query("SELECT COALESCE(SUM(e.currentOperatingHours), 0) FROM Equipment e WHERE e.isActive = true")
    BigDecimal sumTotalOperatingHours();

    @Query("SELECT e.category, COUNT(e), COALESCE(SUM(e.currentOperatingHours), 0) FROM Equipment e WHERE e.isActive = true GROUP BY e.category")
    List<Object[]> getCategoryUtilizationAggregates();
}

