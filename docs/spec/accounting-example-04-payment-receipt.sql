-- Scenario: Patient pays ₹2950 for IPD charges
-- Voucher Type: RECEIPT
-- Voucher No: REC-2024-001

-- Entry 1: Debit Bank
INSERT INTO daybook VALUES (1, 1, 1, '102', '104', 2950.00, 'dr', 'receipt', 'REC-2024-001', '2024-01-17', 'Payment received - Patient 001', NULL, NULL, 1, 1, 2, 1);

-- Entry 2: Credit Accounts Receivable
INSERT INTO daybook VALUES (1, 2, 1, '104', '102', 2950.00, 'cr', 'receipt', 'REC-2024-001', '2024-01-17', 'Payment applied - Patient 001', NULL, NULL, 1, 1, 2, 1);