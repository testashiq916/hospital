-- ===========================================
-- HOSPITAL MANAGEMENT
-- ===========================================

-- Hospitals (Branches)
CREATE TABLE hospitals (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT UNSIGNED NOT NULL,
    hospital_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    zip_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    ambulance_phone VARCHAR(20),
    emergency_phone VARCHAR(20),
    administrator VARCHAR(255),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    hospital_type ENUM('general', 'speciality', 'super_speciality') DEFAULT 'general',
    facility_types JSON,
    total_beds INT DEFAULT 0,
    available_beds INT DEFAULT 0,
    total_doctors INT DEFAULT 0,
    total_nurses INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_head_office BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Hospital Departments
CREATE TABLE departments (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT UNSIGNED NOT NULL,
    hospital_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    head_doctor_id BIGINT UNSIGNED,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    FOREIGN KEY (head_doctor_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Wards
CREATE TABLE wards (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT UNSIGNED NOT NULL,
    hospital_id BIGINT UNSIGNED NOT NULL,
    department_id BIGINT UNSIGNED,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    ward_type ENUM('general', 'semi_private', 'private', 'icu', 'nicu', 'picu', 'isolation') DEFAULT 'general',
    total_beds INT DEFAULT 0,
    available_beds INT DEFAULT 0,
    occupied_beds INT DEFAULT 0,
    floor_number INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- Beds
CREATE TABLE beds (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT UNSIGNED NOT NULL,
    hospital_id BIGINT UNSIGNED NOT NULL,
    ward_id BIGINT UNSIGNED NOT NULL,
    bed_id VARCHAR(50) UNIQUE NOT NULL,
    bed_number VARCHAR(20) NOT NULL,
    bed_type ENUM('general', 'icu', 'private', 'semi_private', 'isolation') DEFAULT 'general',
    daily_rate DECIMAL(15,2) DEFAULT 0,
    status ENUM('available', 'occupied', 'reserved', 'cleaning', 'maintenance') DEFAULT 'available',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    FOREIGN KEY (ward_id) REFERENCES wards(id),
    UNIQUE KEY unique_bed_number (hospital_id, bed_number)
);