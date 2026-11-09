package com.farmverse.equipment.entity;

import com.farmverse.equipment.enums.MaintenanceType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_schedules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @Column(name = "service_name", nullable = false, length = 150)
    private String serviceName;

    @Enumerated(EnumType.STRING)
    @Column(name = "maintenance_type", nullable = false, length = 50)
    private MaintenanceType maintenanceType;

    @Column(name = "interval_days")
    private Integer intervalDays;

    @Column(name = "interval_hours", precision = 10, scale = 2)
    private BigDecimal intervalHours;

    @Column(name = "last_service_date")
    private LocalDate lastServiceDate;

    @Column(name = "last_service_hours", precision = 10, scale = 2)
    private BigDecimal lastServiceHours;

    @Column(name = "next_due_date")
    private LocalDate nextDueDate;

    @Column(name = "next_due_hours", precision = 10, scale = 2)
    private BigDecimal nextDueHours;

    @Column(name = "advance_alert_days")
    @Builder.Default
    private Integer advanceAlertDays = 7;

    @Column(name = "advance_alert_hours", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal advanceAlertHours = BigDecimal.valueOf(25.0);

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}

