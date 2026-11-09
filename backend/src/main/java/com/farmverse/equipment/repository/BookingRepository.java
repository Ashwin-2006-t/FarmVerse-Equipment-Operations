package com.farmverse.equipment.repository;

import com.farmverse.equipment.entity.EquipmentBooking;
import com.farmverse.equipment.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<EquipmentBooking, Long>, JpaSpecificationExecutor<EquipmentBooking> {

    @Query("SELECT b FROM EquipmentBooking b WHERE b.equipment.id = :equipmentId " +
           "AND b.status IN ('APPROVED', 'IN_PROGRESS') " +
           "AND (:startTime < b.endTime AND :endTime > b.startTime)")
    List<EquipmentBooking> findConflictingBookings(@Param("equipmentId") Long equipmentId,
                                                  @Param("startTime") LocalDateTime startTime,
                                                  @Param("endTime") LocalDateTime endTime);

    @Query("SELECT b FROM EquipmentBooking b WHERE b.equipment.id = :equipmentId " +
           "AND b.id <> :bookingId " +
           "AND b.status IN ('APPROVED', 'IN_PROGRESS') " +
           "AND (:startTime < b.endTime AND :endTime > b.startTime)")
    List<EquipmentBooking> findConflictingBookingsExcluding(@Param("equipmentId") Long equipmentId,
                                                           @Param("bookingId") Long bookingId,
                                                           @Param("startTime") LocalDateTime startTime,
                                                           @Param("endTime") LocalDateTime endTime);

    boolean existsByEquipmentId(Long equipmentId);

    List<EquipmentBooking> findByEquipmentIdOrderByStartTimeDesc(Long equipmentId);

    List<EquipmentBooking> findByStatus(BookingStatus status);

    long countByStatus(BookingStatus status);

    @Query("SELECT b FROM EquipmentBooking b WHERE b.startTime BETWEEN :start AND :end OR b.endTime BETWEEN :start AND :end ORDER BY b.startTime ASC")
    List<EquipmentBooking> findBookingsInCalendarRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    List<EquipmentBooking> findTop10ByOrderByCreatedAtDesc();
}

