-- Scenario: Insurance claim for IPD charges (80% coverage)
-- Total Bill: ₹2950, Insurance Coverage: ₹2360, Patient Payable: ₹590

-- Voucher Type: INSURANCE
-- Voucher No: INS-2024-001

-- Entry 1: Debit Insurance Receivable
INSERT INTO daybook VALUES (1, 1, 1, '105', '401', 2360.00, 'dr', 'insurance', 'INS-2024-001', '2024-01-18', 'Insurance claim - Patient 001', NULL, NULL, 1, 1, 2, 1);

-- Entry 2: Debit Patient Receivable (Balance)
INSERT INTO daybook VALUES (1, 2, 1, '104', '401', 590.00, 'dr', 'insurance', 'INS-2024-001', '2024-01-18', 'Patient payable - Patient 001', NULL, NULL, 1, 1, 2, 1);

-- Entry 3: Credit Revenue
INSERT INTO daybook VALUES (1, 3, 1, '401', '105', 2950.00, 'cr', 'insurance', 'INS-2024-001', '2024-01-18', 'IPD revenue - Patient 001', NULL, NULL, 1, 1, 2, 1);