-- FarmVerse Nexus: Equipment Operations Module
-- Flyway Migration V1: Database Schema Initialization

CREATE TABLE IF NOT EXISTS equipment (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    serial_number VARCHAR(100) NOT NULL UNIQUE,
    purchase_date DATE NOT NULL,
    purchase_cost NUMERIC(12, 2) NOT NULL,
    current_operating_hours NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    fuel_type VARCHAR(30) NOT NULL,
    fuel_tank_capacity NUMERIC(8, 2) NOT NULL,
    equipment_condition VARCHAR(50) NOT NULL,
    assigned_farm_id VARCHAR(50) NOT NULL,
    organization_id VARCHAR(50) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(category);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_org ON equipment(organization_id);
CREATE INDEX IF NOT EXISTS idx_equipment_farm ON equipment(assigned_farm_id);

CREATE TABLE IF NOT EXISTS equipment_bookings (
    id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    farm_id VARCHAR(50) NOT NULL,
    organization_id VARCHAR(50) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    work_location VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    approval_remarks TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_bookings_equip_dates ON equipment_bookings(equipment_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON equipment_bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON equipment_bookings(user_id);

CREATE TABLE IF NOT EXISTS equipment_usage (
    id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT NOT NULL,
    booking_id BIGINT UNIQUE,
    farm_id VARCHAR(50) NOT NULL,
    organization_id VARCHAR(50) NOT NULL,
    usage_date DATE NOT NULL,
    start_operating_hours NUMERIC(10, 2) NOT NULL,
    end_operating_hours NUMERIC(10, 2) NOT NULL,
    total_operating_hours NUMERIC(10, 2) NOT NULL,
    fuel_consumed_litres NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    fuel_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    operator_details VARCHAR(150) NOT NULL,
    work_description TEXT NOT NULL,
    additional_expenses NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_usage_cost NUMERIC(10, 2) NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usage_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE RESTRICT,
    CONSTRAINT fk_usage_booking FOREIGN KEY (booking_id) REFERENCES equipment_bookings(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_usage_equipment ON equipment_usage(equipment_id);
CREATE INDEX IF NOT EXISTS idx_usage_date ON equipment_usage(usage_date);

CREATE TABLE IF NOT EXISTS maintenance_records (
    id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT NOT NULL,
    maintenance_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    service_date DATE NOT NULL,
    service_provider VARCHAR(150) NOT NULL,
    technician_name VARCHAR(100) NOT NULL,
    labour_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    spare_parts_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    additional_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_cost NUMERIC(10, 2) NOT NULL,
    previous_operating_hours NUMERIC(10, 2) NOT NULL,
    next_service_date DATE,
    next_service_operating_hour_threshold NUMERIC(10, 2),
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    remarks TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_maintenance_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_maint_equipment ON maintenance_records(equipment_id);
CREATE INDEX IF NOT EXISTS idx_maint_status ON maintenance_records(status);
CREATE INDEX IF NOT EXISTS idx_maint_date ON maintenance_records(service_date);

CREATE TABLE IF NOT EXISTS maintenance_schedules (
    id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT NOT NULL,
    service_name VARCHAR(150) NOT NULL,
    maintenance_type VARCHAR(50) NOT NULL,
    interval_days INTEGER,
    interval_hours NUMERIC(10, 2),
    last_service_date DATE,
    last_service_hours NUMERIC(10, 2),
    next_due_date DATE,
    next_due_hours NUMERIC(10, 2),
    advance_alert_days INTEGER DEFAULT 7,
    advance_alert_hours NUMERIC(10, 2) DEFAULT 25.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    remarks TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_schedule_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_schedule_equipment ON maintenance_schedules(equipment_id);
CREATE INDEX IF NOT EXISTS idx_schedule_due ON maintenance_schedules(next_due_date, next_due_hours);

CREATE TABLE IF NOT EXISTS equipment_notifications (
    id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'INFO',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    organization_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_notif_unread ON equipment_notifications(is_read, created_at DESC);

