-- ===========================================
-- LABORATORY & RADIOLOGY (LIS/RIS)
-- ===========================================

-- Lab Tests
CREATE TABLE lab_tests (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT UNSIGNED NOT NULL,
    hospital_id BIGINT UNSIGNED NOT NULL,
    test_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    price DECIMAL(15,2),
    turnaround_time INT DEFAULT 24,
    specimen_type VARCHAR(100),
    units VARCHAR(50),
    normal_range TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

-- Lab Test Parameters
CREATE TABLE lab_test_parameters (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    lab_test_id BIGINT UNSIGNED NOT NULL,
    parameter_name VARCHAR(255) NOT NULL,
    normal_range_low DECIMAL(15,2),
    normal_range_high DECIMAL(15,2),
    unit VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lab_test_id) REFERENCES lab_tests(id) ON DELETE CASCADE
);

-- Lab Orders
CREATE TABLE lab_orders (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT UNSIGNED NOT NULL,
    hospital_id BIGINT UNSIGNED NOT NULL,
    patient_id BIGINT UNSIGNED NOT NULL,
    doctor_id BIGINT UNSIGNED NOT NULL,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    order_date DATE NOT NULL,
    order_time TIME NOT NULL,
    visit_id BIGINT UNSIGNED,
    admission_id BIGINT UNSIGNED,
    order_type ENUM('laboratory', 'radiology', 'pathology') DEFAULT 'laboratory',
    priority ENUM('routine', 'urgent', 'stat') DEFAULT 'routine',
    clinical_notes TEXT,
    status ENUM('ordered', 'collected', 'processing', 'completed', 'cancelled') DEFAULT 'ordered',
    collected_by BIGINT UNSIGNED,
    collected_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    notes TEXT,
    created_by BIGINT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id),
    FOREIGN KEY (visit_id) REFERENCES patient_visits(id) ON DELETE SET NULL,
    FOREIGN KEY (admission_id) REFERENCES patient_admissions(id) ON DELETE SET NULL,
    FOREIGN KEY (collected_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Lab Order Items
CREATE TABLE lab_order_items (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    lab_order_id BIGINT UNSIGNED NOT NULL,
    lab_test_id BIGINT UNSIGNED NOT NULL,
    specimen_id VARCHAR(50),
    sample_collected_at TIMESTAMP NULL,
    sample_received_at TIMESTAMP NULL,
    result DECIMAL(15,2),
    result_text TEXT,
    result_status ENUM('pending', 'processing', 'completed', 'abnormal') DEFAULT 'pending',
    range_low DECIMAL(15,2),
    range_high DECIMAL(15,2),
    unit VARCHAR(50),
    remarks TEXT,
    is_abnormal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lab_order_id) REFERENCES lab_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (lab_test_id) REFERENCES lab_tests(id)
);

-- Lab Reports
CREATE TABLE lab_reports (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT UNSIGNED NOT NULL,
    hospital_id BIGINT UNSIGNED NOT NULL,
    lab_order_id BIGINT UNSIGNED NOT NULL,
    patient_id BIGINT UNSIGNED NOT NULL,
    report_id VARCHAR(50) UNIQUE NOT NULL,
    report_date DATE NOT NULL,
    report_time TIME NOT NULL,
    report_title VARCHAR(255),
    clinical_interpretation TEXT,
    recommendation TEXT,
    pdf_path VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by BIGINT UNSIGNED,
    verified_at TIMESTAMP NULL,
    ai_analysis TEXT,
    ai_risk_score DECIMAL(5,2),
    status ENUM('draft', 'verified', 'reported', 'cancelled') DEFAULT 'draft',
    created_by BIGINT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    FOREIGN KEY (lab_order_id) REFERENCES lab_orders(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (verified_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Radiology (RIS)
CREATE TABLE radiology_tests (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT UNSIGNED NOT NULL,
    hospital_id BIGINT UNSIGNED NOT NULL,
    test_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    modality ENUM('xray', 'ct', 'mri', 'ultrasound', 'pet', 'mammogram', 'fluoroscopy') DEFAULT 'xray',
    description TEXT,
    price DECIMAL(15,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

-- Radiology Orders
CREATE TABLE radiology_orders (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT UNSIGNED NOT NULL,
    hospital_id BIGINT UNSIGNED NOT NULL,
    patient_id BIGINT UNSIGNED NOT NULL,
    doctor_id BIGINT UNSIGNED NOT NULL,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    order_date DATE NOT NULL,
    order_time TIME NOT NULL,
    visit_id BIGINT UNSIGNED,
    admission_id BIGINT UNSIGNED,
    radiology_test_id BIGINT UNSIGNED NOT NULL,
    body_part VARCHAR(255),
    clinical_indication TEXT,
    priority ENUM('routine', 'urgent', 'stat') DEFAULT 'routine',
    status ENUM('ordered', 'scheduled', 'performed', 'reported', 'cancelled') DEFAULT 'ordered',
    performed_by BIGINT UNSIGNED,
    performed_at TIMESTAMP NULL,
    report_text TEXT,
    dicom_images JSON,
    pdf_path VARCHAR(255),
    ai_analysis TEXT,
    created_by BIGINT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id),
    FOREIGN KEY (visit_id) REFERENCES patient_visits(id) ON DELETE SET NULL,
    FOREIGN KEY (admission_id) REFERENCES patient_admissions(id) ON DELETE SET NULL,
    FOREIGN KEY (radiology_test_id) REFERENCES radiology_tests(id),
    FOREIGN KEY (performed_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Blood Bank
CREATE TABLE blood_bank (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT UNSIGNED NOT NULL,
    hospital_id BIGINT UNSIGNED NOT NULL,
    donor_id VARCHAR(50),
    donor_name VARCHAR(255),
    blood_group VARCHAR(10) NOT NULL,
    rh_factor ENUM('positive', 'negative') DEFAULT 'positive',
    component_type ENUM('whole_blood', 'packed_rbc', 'platelets', 'plasma', 'cryoprecipitate') DEFAULT 'whole_blood',
    quantity DECIMAL(10,2) DEFAULT 0,
    unit VARCHAR(20) DEFAULT 'ml',
    collection_date DATE,
    expiry_date DATE,
    is_screened BOOLEAN DEFAULT FALSE,
    screening_results TEXT,
    status ENUM('available', 'reserved', 'issued', 'expired', 'discarded') DEFAULT 'available',
    issued_to_patient_id BIGINT UNSIGNED,
    issued_by BIGINT UNSIGNED,
    issued_at TIMESTAMP NULL,
    notes TEXT,
    created_by BIGINT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    FOREIGN KEY (issued_to_patient_id) REFERENCES patients(id) ON DELETE SET NULL,
    FOREIGN KEY (issued_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);