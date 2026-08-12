-- Scenario: IPD Admission with Room Charges
-- Room Daily Rate: ₹2000, Consultation: ₹500
-- Total: ₹2500, GST 18%: ₹450, Grand Total: ₹2950

-- Voucher Type: BILLING
-- Voucher No: BIL-2024-002

-- Entry 1: Debit Accounts Receivable (Patient)
INSERT INTO daybook VALUES (1, 1, 1, '104', '401', 2950.00, 'dr', 'billing', 'BIL-2024-002', '2024-01-16', 'IPD Charges - Patient 001', NULL, NULL, 1, 1, 2, 1);

-- Entry 2: Credit Room Revenue
INSERT INTO daybook VALUES (1, 2, 1, '403', '104', 2000.00, 'cr', 'billing', 'BIL-2024-002', '2024-01-16', 'Room charges', NULL, NULL, 1, 1, 2, 1);

-- Entry 3: Credit Consultation Revenue
INSERT INTO daybook VALUES (1, 3, 1, '401', '104', 500.00, 'cr', 'billing', 'BIL-2024-002', '2024-01-16', 'Consultation fee', NULL, NULL, 1, 1, 2, 1);

-- Entry 4: Credit GST Payable
INSERT INTO daybook VALUES (1, 4, 1, '202', '104', 225.00, 'cr', 'billing', 'BIL-2024-002', '2024-01-16', 'CGST collected', NULL, NULL, 1, 1, 2, 1);

INSERT INTO daybook VALUES (1, 5, 1, '203', '104', 225.00, 'cr', 'billing', 'BIL-2024-002', '2024-01-16', 'SGST collected', NULL, NULL, 1, 1, 2, 1);