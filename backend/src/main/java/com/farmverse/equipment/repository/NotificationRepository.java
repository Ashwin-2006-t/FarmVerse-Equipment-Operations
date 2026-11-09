package com.farmverse.equipment.repository;

import com.farmverse.equipment.entity.EquipmentNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<EquipmentNotification, Long> {

    List<EquipmentNotification> findTop25ByOrderByCreatedAtDesc();

    List<EquipmentNotification> findByIsReadFalseOrderByCreatedAtDesc();

    long countByIsReadFalse();
}

