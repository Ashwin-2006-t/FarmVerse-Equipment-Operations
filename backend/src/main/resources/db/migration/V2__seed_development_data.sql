-- FarmVerse Nexus: Equipment Operations Module
-- Flyway Migration V2: Development Seed Data

-- 1. Insert Equipment across multiple agricultural categories (IDs 1 to 10 automatically generated)
INSERT INTO equipment (
    name, category, brand, model, registration_number, serial_number, 
    purchase_date, purchase_cost, current_operating_hours, fuel_type, 
    fuel_tank_capacity, equipment_condition, assigned_farm_id, organization_id, 
    description, image_url, status, is_active, created_at, updated_at
) VALUES 
(
    'John Deere 5075E Heavy Utility Tractor', 'TRACTORS', 'John Deere', '5075E 4WD', 
    'AG-TRAC-2024-001', 'JD5075E-SN882910', '2023-03-15', 38500.00, 480.50, 'DIESEL', 
    68.00, 'EXCELLENT', 'FARM-NORTH-01', 'ORG-FV-001', 
    '75 HP Turbocharged utility tractor equipped with front-end loader linkage and dual rear hydraulic valves for intensive tillage and heavy hauling.',
    'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
    'AVAILABLE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    'Mahindra 575 DI High-Torque Tractor', 'TRACTORS', 'Mahindra', '575 DI Sarpanch', 
    'AG-TRAC-2023-014', 'MH575DI-SN419082', '2022-07-20', 16500.00, 1120.00, 'DIESEL', 
    47.50, 'GOOD', 'FARM-SOUTH-02', 'ORG-FV-001', 
    '47 HP robust farm tractor ideal for puddling, rotavator operations, and inter-cultivation across black cotton soils.',
    'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=800&q=80',
    'BOOKED', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    'Claas Dominator 130 Multi-Crop Combine Harvester', 'HARVESTERS', 'Claas', 'Dominator 130', 
    'AG-HARV-2023-002', 'CD130-SN993012', '2023-09-10', 89000.00, 310.20, 'DIESEL', 
    200.00, 'EXCELLENT', 'FARM-EAST-01', 'ORG-FV-001', 
    'High throughput combine harvester with 4.2m cutterbar, grain tank capacity of 3200 litres, suited for paddy, wheat and soybean.',
    'https://images.unsplash.com/photo-1548685913-fe6678babe8d?auto=format&fit=crop&w=800&q=80',
    'AVAILABLE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    'ASPEE HTP Tractor-Mounted Boom Sprayer', 'SPRAYERS', 'ASPEE', 'HTP-600L', 
    'AG-SPRY-2024-005', 'ASP600-SN118492', '2024-01-12', 4800.00, 145.00, 'PTO_POWERED', 
    0.00, 'EXCELLENT', 'FARM-NORTH-01', 'ORG-FV-001', 
    '600-litre chemical spray tank with 12-meter hydraulic boom and anti-drip nozzle bodies for uniform crop canopy protection.',
    'https://images.unsplash.com/photo-1589876735502-0c7f0b540203?auto=format&fit=crop&w=800&q=80',
    'IN_USE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    'Kirloskar 10HP High-Discharge Diesel Water Pump', 'WATER_PUMPS', 'Kirloskar', 'Mega 50-DI', 
    'AG-PUMP-2023-009', 'KP50DI-SN334901', '2023-05-18', 3200.00, 680.00, 'DIESEL', 
    18.00, 'FAIR', 'FARM-RIVER-03', 'ORG-FV-001', 
    'Centrifugal irrigation pump unit capable of delivering 1100 LPM at 25-meter head, mounted on heavy-duty trolley with suction hose.',
    'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80',
    'UNDER_MAINTENANCE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    'Lemken Achat 70 Heavy-Duty Cultivator', 'CULTIVATORS', 'Lemken', 'Achat 70/9', 
    'AG-CULT-2023-003', 'LK709-SN771920', '2023-02-14', 5900.00, 290.00, 'NONE', 
    0.00, 'GOOD', 'FARM-NORTH-01', 'ORG-FV-001', 
    '9-tyne spring-loaded duckfoot cultivator designed for stubble breaking and deep soil aeration up to 22 cm.',
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
    'AVAILABLE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    'Shaktiman Pneumatic Planter & Seed Drill', 'SEED_DRILLS', 'Shaktiman', 'AirDrill 900', 
    'AG-SEED-2024-008', 'SD900-SN821390', '2024-02-28', 11200.00, 95.00, 'PTO_POWERED', 
    0.00, 'EXCELLENT', 'FARM-WEST-01', 'ORG-FV-001', 
    'Precision vacuum seed meter drill for maize, sunflower, pulses and cotton with integrated granular fertilizer hopper.',
    'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80',
    'AVAILABLE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    'Fieldking Heavy Reversible Hydraulic Mouldboard Plough', 'PLOUGHS', 'Fieldking', 'FKMBD-3', 
    'AG-PLGH-2022-011', 'FKMB3-SN102934', '2022-11-05', 4200.00, 395.00, 'NONE', 
    0.00, 'GOOD', 'FARM-SOUTH-02', 'ORG-FV-001', 
    '3-bottom turnover reversible disc mouldboard plough with hardened boron steel shears for complete trash inversion.',
    'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80',
    'AVAILABLE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    'VST Shakti 130 DI Power Tiller', 'TILLERS', 'VST', '130DI 13HP', 
    'AG-TILL-2023-018', 'VST130-SN552910', '2023-06-11', 2800.00, 520.00, 'DIESEL', 
    11.00, 'GOOD', 'FARM-TERRACE-04', 'ORG-FV-001', 
    'Single-cylinder horizontal 13HP water-cooled power tiller fitted with 16-blade rotary tiller for wetland puddling and orchard weeding.',
    'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=800&q=80',
    'OUT_OF_SERVICE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    'Farm King 5-Ton Hydraulic Tipping Trailer', 'TRAILERS', 'Farm King', 'FK-5T-TIP', 
    'AG-TRLR-2022-007', 'FK5T-SN902183', '2022-04-19', 6100.00, 780.00, 'NONE', 
    0.00, 'GOOD', 'FARM-NORTH-01', 'ORG-FV-001', 
    'All-steel twin axle heavy harvest transport trailer with telescopic 3-stage hydraulic ram and removable drop-sides.',
    'https://images.unsplash.com/photo-1598511726623-d2e9996892f0?auto=format&fit=crop&w=800&q=80',
    'AVAILABLE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- 2. Insert Bookings (IDs 1 to 6 automatically generated)
INSERT INTO equipment_bookings (
    equipment_id, user_id, user_name, user_role, farm_id, organization_id, 
    start_time, end_time, purpose, work_location, status, approval_remarks, 
    created_at, updated_at
) VALUES 
(
    2, 'USR-FARMER-01', 'Ramesh Patel', 'FARMER', 'FARM-SOUTH-02', 'ORG-FV-001',
    '2026-11-10 07:00:00', '2026-11-12 18:00:00', 'Post-monsoon deep ploughing and seedbed levelling', 
    'Block B - Cotton Sector', 'APPROVED', 'Approved for schedule. Ensure pre-operational fluid check is conducted.',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    4, 'USR-FARMER-02', 'Sita Devi', 'FARMER', 'FARM-NORTH-01', 'ORG-FV-001',
    '2026-11-08 06:00:00', '2026-11-08 20:00:00', 'Prophylactic fungicide spray for orchard canopy', 
    'Citrus Grove 3', 'IN_PROGRESS', 'Authorized with protective equipment gear.',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    1, 'USR-FARMER-03', 'Vikram Singh', 'FARMER', 'FARM-NORTH-01', 'ORG-FV-001',
    '2026-11-15 08:00:00', '2026-11-17 17:00:00', 'Sugarcane trenching and furrow preparation', 
    'North Field Plot 4A', 'PENDING', NULL,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    3, 'USR-FARMER-01', 'Ramesh Patel', 'FARMER', 'FARM-EAST-01', 'ORG-FV-001',
    '2026-11-20 06:30:00', '2026-11-22 19:00:00', 'Paddy combine harvesting before impending weather front', 
    'Basmati Paddy Field 12', 'PENDING', NULL,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    1, 'USR-FARMER-04', 'Ananya Sharma', 'FARMER', 'FARM-WEST-01', 'ORG-FV-001',
    '2026-10-25 08:00:00', '2026-10-27 18:00:00', 'Primary tillage and green manure incorporation', 
    'Organic Wheat Field #2', 'COMPLETED', 'Completed on time with zero operational incidents.',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    5, 'USR-FARMER-02', 'Sita Devi', 'FARMER', 'FARM-RIVER-03', 'ORG-FV-001',
    '2026-11-05 09:00:00', '2026-11-06 17:00:00', 'Canal lift irrigation for mustard crop', 
    'Canal Siphon 4', 'REJECTED', 'Equipment has a diagnosed cooling system leak and is scheduled for maintenance.',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- 3. Insert Historical Equipment Usage
INSERT INTO equipment_usage (
    equipment_id, booking_id, farm_id, organization_id, usage_date, 
    start_operating_hours, end_operating_hours, total_operating_hours, 
    fuel_consumed_litres, fuel_cost, operator_details, work_description, 
    additional_expenses, total_usage_cost, remarks, created_at, updated_at
) VALUES 
(
    1, 5, 'FARM-WEST-01', 'ORG-FV-001', '2026-10-26', 
    462.50, 480.50, 18.00, 84.50, 105.62, 'Harish Verma (Senior Operator #44)', 
    'Primary mouldboard deep tilling and rotavating across 14 acres of clayey soil.',
    25.00, 130.62, 'Fuel topped up at main farm storage. Grease nipples serviced.',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    2, NULL, 'FARM-SOUTH-02', 'ORG-FV-001', '2026-10-18', 
    1102.00, 1120.00, 18.00, 62.00, 77.50, 'Sunil Yadav (Operator)', 
    'Seedbed harrowing and furrow laying in plot 7 for pulse sowing.',
    0.00, 77.50, 'Optimal diesel consumption efficiency noted.',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    3, NULL, 'FARM-EAST-01', 'ORG-FV-001', '2026-10-04', 
    286.20, 310.20, 24.00, 192.00, 240.00, 'Gurpreet Singh (Claas Certified Operator)', 
    'Harvested 38 acres of early soybean crop. Average grain loss under 1.2%.',
    50.00, 290.00, 'Cutterbar knives replaced prior to start.',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- 4. Insert Maintenance Records
INSERT INTO maintenance_records (
    equipment_id, maintenance_type, description, service_date, 
    service_provider, technician_name, labour_cost, spare_parts_cost, 
    additional_cost, total_cost, previous_operating_hours, next_service_date, 
    next_service_operating_hour_threshold, status, remarks, created_at, updated_at
) VALUES 
(
    1, 'REGULAR_SERVICING', '500-hour comprehensive factory service, engine oil replacement, primary & secondary fuel filter renewal', 
    '2026-10-15', 'Deere Authorized AgriCare Center', 'Rajesh Nair', 
    180.00, 345.50, 40.00, 565.50, 450.00, '2027-04-15', 700.00, 
    'COMPLETED', 'Hydraulic fluid sampled and verified within viscosity limits.',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    5, 'ENGINE_MAINTENANCE', 'Overheating troubleshooting, water pump impeller replacement and radiator flushing', 
    '2026-11-07', 'Shree Krishna Diesel Works', 'Mohan Lal', 
    95.00, 160.00, 20.00, 275.00, 680.00, '2026-11-12', 800.00, 
    'IN_PROGRESS', 'Parts ordered; replacement impeller arriving tomorrow morning.',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    9, 'BREAKDOWN_REPAIR', 'Power tiller transmission gear engagement failure and clutch cable snap', 
    '2026-11-02', 'Apex Farm Equipment Mechanics', 'Balwant Singh', 
    120.00, 210.00, 15.00, 345.00, 520.00, '2026-11-18', 650.00, 
    'SCHEDULED', 'Awaiting new high-tensile clutch assembly from regional distributor.',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    2, 'TYRE_MAINTENANCE', 'Rear tractor tyre puncture vulcanization and ballast fluid balancing', 
    '2026-09-22', 'Goodyear Agri Tyres Station', 'Dinesh Kumar', 
    45.00, 35.00, 10.00, 90.00, 1080.00, '2027-03-22', 1350.00, 
    'COMPLETED', 'Tyre inflation set to 18 PSI for optimal drawbar pull.',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- 5. Insert Maintenance Schedules
INSERT INTO maintenance_schedules (
    equipment_id, service_name, maintenance_type, interval_days, interval_hours, 
    last_service_date, last_service_hours, next_due_date, next_due_hours, 
    advance_alert_days, advance_alert_hours, is_active, remarks, created_at, updated_at
) VALUES 
(
    1, 'John Deere 250-Hour Lube & Inspection', 'REGULAR_SERVICING', 180, 250.00, 
    '2026-10-15', 450.00, '2027-04-15', 700.00, 14, 25.00, true, 
    'Includes front axle oil inspection and air cleaner element blowing.',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    2, 'Mahindra Engine Oil & Filter Routine', 'OIL_REPLACEMENT', 120, 250.00, 
    '2026-08-10', 1000.00, '2026-12-10', 1250.00, 10, 30.00, true, 
    'Use 15W-40 CI-4 diesel engine oil strictly.',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    3, 'Claas Harvester Pre-Harvest Comprehensive Overhaul', 'HYDRAULIC_MAINTENANCE', 365, 300.00, 
    '2026-07-15', 250.00, '2026-11-15', 550.00, 15, 40.00, true, 
    'Next service is approaching due to scheduled date within 7 days.',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    5, 'Kirloskar Pump Cooling Loop Descaling', 'ENGINE_MAINTENANCE', 90, 200.00, 
    '2026-07-20', 480.00, '2026-10-20', 680.00, 7, 20.00, true, 
    'Service is OVERDUE based on date threshold and operating hours.',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- 6. Insert In-App Notifications
INSERT INTO equipment_notifications (
    equipment_id, title, message, notification_type, severity, is_read, 
    organization_id, created_at
) VALUES 
(
    5, 'Overdue Maintenance Alert', 'Kirloskar 10HP High-Discharge Pump has exceeded its scheduled maintenance interval (Due: 2026-10-20, Current: 680 hrs). Service immediately.', 
    'MAINTENANCE_OVERDUE', 'WARNING', false, 'ORG-FV-001', CURRENT_TIMESTAMP
),
(
    3, 'Upcoming Service Window Approaching', 'Claas Dominator 130 Combine is approaching its scheduled Pre-Harvest Overhaul on 2026-11-15.', 
    'MAINTENANCE_APPROACHING', 'INFO', false, 'ORG-FV-001', CURRENT_TIMESTAMP
),
(
    1, 'New Booking Request Submitted', 'Vikram Singh requested John Deere 5075E for Sugarcane trenching from 2026-11-15 to 2026-11-17. Awaiting Admin Approval.', 
    'BOOKING_REQUESTED', 'INFO', false, 'ORG-FV-001', CURRENT_TIMESTAMP
),
(
    9, 'Equipment Breakdown Logged', 'VST Shakti 130 DI reported clutch and transmission failure. Status changed to OUT_OF_SERVICE.', 
    'BREAKDOWN_REPORTED', 'ERROR', true, 'ORG-FV-001', CURRENT_TIMESTAMP
);
