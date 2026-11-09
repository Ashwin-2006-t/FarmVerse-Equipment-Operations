package com.farmverse.equipment.entity;

import com.farmverse.equipment.enums.MaintenanceStatus;
import com.farmverse.equipment.enums.MaintenanceType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @Enumerated(EnumType.STRING)
    @Column(name = "maintenance_type", nullable = false, length = 50)
    private MaintenanceType maintenanceType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "service_date", nullable = false)
    private LocalDate serviceDate;

    @Column(name = "service_provider", nullable = false, length = 150)
    private String serviceProvider;

    @Column(name = "technician_name", nullable = false, length = 100)
    private String technicianName;

    @Column(name = "labour_cost", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal labourCost = BigDecimal.ZERO;

    @Column(name = "spare_parts_cost", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal sparePartsCost = BigDecimal.ZERO;

    @Column(name = "additional_cost", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal additionalCost = BigDecimal.ZERO;

    @Column(name = "total_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalCost;

    @Column(name = "previous_operating_hours", nullable = false, precision = 10, scale = 2)
    private BigDecimal previousOperatingHours;

    @Column(name = "next_service_date")
    private LocalDate nextServiceDate;

    @Column(name = "next_service_operating_hour_threshold", precision = 10, scale = 2)
    private BigDecimal nextServiceOperatingHourThreshold;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private MaintenanceStatus status = MaintenanceStatus.SCHEDULED;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}

