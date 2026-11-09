package com.farmverse.equipment.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "equipment_usage")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", unique = true)
    private EquipmentBooking booking;

    @Column(name = "farm_id", nullable = false, length = 50)
    private String farmId;

    @Column(name = "organization_id", nullable = false, length = 50)
    private String organizationId;

    @Column(name = "usage_date", nullable = false)
    private LocalDate usageDate;

    @Column(name = "start_operating_hours", nullable = false, precision = 10, scale = 2)
    private BigDecimal startOperatingHours;

    @Column(name = "end_operating_hours", nullable = false, precision = 10, scale = 2)
    private BigDecimal endOperatingHours;

    @Column(name = "total_operating_hours", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalOperatingHours;

    @Column(name = "fuel_consumed_litres", nullable = false, precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal fuelConsumedLitres = BigDecimal.ZERO;

    @Column(name = "fuel_cost", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal fuelCost = BigDecimal.ZERO;

    @Column(name = "operator_details", nullable = false, length = 150)
    private String operatorDetails;

    @Column(name = "work_description", nullable = false, columnDefinition = "TEXT")
    private String workDescription;

    @Column(name = "additional_expenses", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal additionalExpenses = BigDecimal.ZERO;

    @Column(name = "total_usage_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalUsageCost;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}

