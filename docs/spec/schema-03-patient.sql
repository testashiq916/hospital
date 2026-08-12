-- ===========================================
-- PATIENT MANAGEMENT
-- ===========================================

-- Patient Types
CREATE TABLE patient_types (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT UNSIGNED NOT NULL,
    hospital_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

-- Patients
CREATE TABLE patients (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT UNSIGNED NOT NULL,
    hospital_id BIGINT UNSIGNED NOT NULL,
    patient_id VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT UNSIGNED,
    patient_type_id BIGINT UNSIGNED,
    
    -- Personal Details
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    gender ENUM('male', 'female', 'other') NOT NULL,
    date_of_birth DATE NOT NULL,
    age INT,
    blood_group VARCHAR(10),
    marital_status ENUM('single', 'married', 'divorced', 'widowed') DEFAULT 'single',
    
    -- Contact
    email VARCHAR(255),
    mobile VARCHAR(20) NOT NULL,
    alternate_mobile VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    zip_code VARCHAR(20),
    
    -- Family
    guardian_name VARCHAR(255),
    guardian_relationship VARCHAR(50),
    guardian_contact VARCHAR(20),
    spouse_name VARCHAR(255),
    father_name VARCHAR(255),
    mother_name VARCHAR(255),
    
    -- Medical
    blood_pressure VARCHAR(20),
    allergies TEXT,
    chronic_diseases TEXT,
    medications TEXT,
    family_history TEXT,
    social_history TEXT,
    
    -- Insurance
    insurance_provider VARCHAR(255),
    insurance_policy_number VARCHAR(50),
    insurance_expiry DATE,
    insurance_coverage DECIMAL(15,2),
    tpa_name VARCHAR(255),
    tpa_id VARCHAR(50),
    
    -- Emergency
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_deceased BOOLEAN DEFAULT FALSE,
    deceased_date DATE,
    deceased_reason TEXT,
    
    -- Registration
    registration_date DATE NOT NULL,
    registration_type ENUM('opd', 'ipd', 'emergency') DEFAULT 'opd',
    created_by BIGINT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (patient_type_id) REFERENCES patient_types(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Patient Family Members
CREATE TABLE patient_family (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    patient_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    contact VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Patient Documents
CREATE TABLE patient_documents (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    patient_id BIGINT UNSIGNED NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_path VARCHAR(255) NOT NULL,
    document_number VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by BIGINT UNSIGNED,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id)
);

-- Patient Visits (OPD)
CREATE TABLE patient_visits (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT UNSIGNED NOT NULL,
    hospital_id BIGINT UNSIGNED NOT NULL,
    patient_id BIGINT UNSIGNED NOT NULL,
    doctor_id BIGINT UNSIGNED NOT NULL,
    visit_id VARCHAR(50) UNIQUE NOT NULL,
    visit_date DATE NOT NULL,
    visit_time TIME NOT NULL,
    visit_type ENUM('opd', 'emergency', 'follow_up', 'consultation') DEFAULT 'opd',
    department_id BIGINT UNSIGNED,
    token_number INT,
    queue_number INT,
    chief_complaint TEXT,
    present_illness TEXT,
    past_medical_history TEXT,
    clinical_notes TEXT,
    diagnosis TEXT,
    referral_doctor VARCHAR(255),
    referral_hospital VARCHAR(255),
    status ENUM('waiting', 'in_progress', 'completed', 'cancelled') DEFAULT 'waiting',
    is_emergency BOOLEAN DEFAULT FALSE,
    created_by BIGINT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id),
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Patient Admissions (IPD)
CREATE TABLE patient_admissions (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT UNSIGNED NOT NULL,
    hospital_id BIGINT UNSIGNED NOT NULL,
    patient_id BIGINT UNSIGNED NOT NULL,
    doctor_id BIGINT UNSIGNED NOT NULL,
    admission_id VARCHAR(50) UNIQUE NOT NULL,
    admission_date DATE NOT NULL,
    admission_time TIME NOT NULL,
    admission_type ENUM('elective', 'emergency', 'transfer') DEFAULT 'elective',
    bed_id BIGINT UNSIGNED,
    ward_id BIGINT UNSIGNED,
    department_id BIGINT UNSIGNED,
    diagnosis TEXT,
    treatment_plan TEXT,
    attending_doctor_id BIGINT UNSIGNED,
    status ENUM('active', 'discharged', 'transferred', 'expired') DEFAULT 'active',
    discharge_date DATE,
    discharge_time TIME,
    discharge_summary TEXT,
    discharge_instructions TEXT,
    length_of_stay INT DEFAULT 0,
    readmission_reason TEXT,
    is_readmission BOOLEAN DEFAULT FALSE,
    created_by BIGINT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id),
    FOREIGN KEY (bed_id) REFERENCES beds(id) ON DELETE SET NULL,
    FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (attending_doctor_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Case Sheets / Progress Notes
CREATE TABLE case_sheets (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT UNSIGNED NOT NULL,
    hospital_id BIGINT UNSIGNED NOT NULL,
    patient_id BIGINT UNSIGNED NOT NULL,
    admission_id BIGINT UNSIGNED,
    visit_id BIGINT UNSIGNED,
    doctor_id BIGINT UNSIGNED NOT NULL,
    case_sheet_id VARCHAR(50) UNIQUE NOT NULL,
    note_date DATE NOT NULL,
    note_time TIME NOT NULL,
    note_type ENUM('admission', 'progress', 'discharge', 'consultation', 'procedure') DEFAULT 'progress',
    subjective TEXT,
    objective TEXT,
    assessment TEXT,
    plan TEXT,
    vitals JSON,
    investigations TEXT,
    treatment_given TEXT,
    remarks TEXT,
    status ENUM('draft', 'final', 'amended') DEFAULT 'draft',
    created_by BIGINT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (admission_id) REFERENCES patient_admissions(id) ON DELETE SET NULL,
    FOREIGN KEY (visit_id) REFERENCES patient_visits(id) ON DELETE SET NULL,
    FOREIGN KEY (doctor_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Health Timeline
CREATE TABLE patient_timeline (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    company_id BIGINT UNSIGNED NOT NULL,
    hospital_id BIGINT UNSIGNED NOT NULL,
    patient_id BIGINT UNSIGNED NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    event_type ENUM('visit', 'admission', 'discharge', 'lab_test', 'radiology', 'procedure', 'surgery', 'prescription', 'vital', 'note', 'other') NOT NULL,
    event_title VARCHAR(255) NOT NULL,
    event_description TEXT,
    reference_type VARCHAR(100),
    reference_id BIGINT UNSIGNED,
    created_by BIGINT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_patient_timeline (patient_id, event_date)
);