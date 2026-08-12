-- Scenario: OPD Consultation - Patient visit with payment
-- Consultation Fee: ₹500, Lab Test: ₹1000
-- Total: ₹1500, GST 18%: ₹270, Grand Total: ₹1770

-- Voucher Type: BILLING
-- Voucher No: BIL-2024-001

-- Entry 1: Debit Bank/Cash (Payment Received)
INSERT INTO daybook VALUES (1, 1, 1, '102', '401', 1770.00, 'dr', 'billing', 'BIL-2024-001', '2024-01-15', 'OPD Consultation payment', NULL, NULL, 1, 1, 1, 1);

-- Entry 2: Credit Consultation Revenue
INSERT INTO daybook VALUES (1, 2, 1, '401', '102', 500.00, 'cr', 'billing', 'BIL-2024-001', '2024-01-15', 'Consultation fee', NULL, NULL, 1, 1, 1, 1);

-- Entry 3: Credit Lab Revenue
INSERT INTO daybook VALUES (1, 3, 1, '402', '102', 1000.00, 'cr', 'billing', 'BIL-2024-001', '2024-01-15', 'Lab test fee', NULL, NULL, 1, 1, 1, 1);

-- Entry 4: Credit GST Payable - CGST
INSERT INTO daybook VALUES (1, 4, 1, '202', '102', 135.00, 'cr', 'billing', 'BIL-2024-001', '2024-01-15', 'CGST collected', NULL, NULL, 1, 1, 1, 1);

-- Entry 5: Credit GST Payable - SGST
INSERT INTO daybook VALUES (1, 5, 1, '203', '102', 135.00, 'cr', 'billing', 'BIL-2024-001', '2024-01-15', 'SGST collected', NULL, NULL, 1, 1, 1, 1);