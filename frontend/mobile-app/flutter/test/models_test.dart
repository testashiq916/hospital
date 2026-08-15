import 'package:flutter_test/flutter_test.dart';
import 'package:hms_patient_app/models/appointment.dart';
import 'package:hms_patient_app/models/bill.dart';
import 'package:hms_patient_app/models/paginated_response.dart';
import 'package:hms_patient_app/models/patient.dart';
import 'package:hms_patient_app/models/prescription.dart';

/// Unit tests for the JSON-mapping layer that talks to the Laravel API.
/// These pin down the exact field names (`appointment_id` vs `id`, nested
/// `doctor`/`patient` relations, decimal-as-string amounts, etc.) so a
/// backend response-shape change fails loudly here instead of silently in
/// the UI.
void main() {
  group('Appointment.fromJson', () {
    test('parses a full appointment payload', () {
      final json = {
        'id': 7,
        'appointment_id': 'APT-2026-ABC123',
        'patient_id': 3,
        'doctor_id': 5,
        'doctor': {'first_name': 'Dev', 'last_name': 'Sharma'},
        'appointment_date': '2026-08-20',
        'appointment_time': '09:30:00',
        'appointment_type': 'opd',
        'status': 'scheduled',
        'token_number': 4,
        'queue_number': 4,
        'estimated_wait_time': 45,
        'is_emergency': false,
        'is_teleconsultation': false,
      };

      final appointment = Appointment.fromJson(json);

      expect(appointment.id, 7);
      expect(appointment.appointmentCode, 'APT-2026-ABC123');
      expect(appointment.doctorName, 'Dev Sharma');
      expect(appointment.tokenNumber, 4);
      expect(appointment.isUpcoming, isTrue);
      expect(appointment.appointmentDate, DateTime(2026, 8, 20));
    });

    test('cancelled/completed appointments are not upcoming', () {
      for (final status in ['completed', 'cancelled', 'no_show']) {
        final appointment = Appointment.fromJson({
          'id': 1,
          'patient_id': 1,
          'doctor_id': 1,
          'appointment_time': '10:00:00',
          'status': status,
        });
        expect(appointment.isUpcoming, isFalse, reason: status);
      }
    });
  });

  group('PaginatedResponse', () {
    test('fromJson unwraps Laravel paginator envelope', () {
      final json = {
        'data': [
          {'id': 1, 'patient_id': 1, 'doctor_id': 1, 'appointment_time': '09:00:00'},
          {'id': 2, 'patient_id': 1, 'doctor_id': 1, 'appointment_time': '10:00:00'},
        ],
        'current_page': 1,
        'last_page': 3,
        'total': 25,
      };

      final page = PaginatedResponse<Appointment>.fromJson(
        json,
        Appointment.fromJson,
      );

      expect(page.data.length, 2);
      expect(page.currentPage, 1);
      expect(page.lastPage, 3);
      expect(page.hasMore, isTrue);
    });

    test('fromList wraps a bare JSON array', () {
      final page = PaginatedResponse<Appointment>.fromList(
        [
          {'id': 1, 'patient_id': 1, 'doctor_id': 1, 'appointment_time': '09:00:00'}
        ],
        Appointment.fromJson,
      );
      expect(page.data.length, 1);
      expect(page.hasMore, isFalse);
    });
  });

  group('HospitalBill.fromJson', () {
    test('parses amounts and nested items/payments', () {
      final bill = HospitalBill.fromJson({
        'id': 12,
        'bill_id': 'BIL-2026-XYZ',
        'patient_id': 3,
        'bill_date': '2026-08-10',
        'total_amount': '1500.00',
        'paid_amount': '500.00',
        'balance_amount': '1000.00',
        'payment_status': 'partial',
        'items': [
          {
            'id': 1,
            'description': 'Consultation',
            'quantity': '1',
            'unit_price': '500.00',
            'total': '500.00',
          },
        ],
        'payments': [
          {
            'id': 1,
            'payment_id': 'PAY-2026-A1',
            'bill_id': 12,
            'amount': '500.00',
            'payment_method': 'cash',
            'status': 'success',
          },
        ],
      });

      expect(bill.billCode, 'BIL-2026-XYZ');
      expect(bill.totalAmount, 1500.0);
      expect(bill.balanceAmount, 1000.0);
      expect(bill.items.single.description, 'Consultation');
      expect(bill.payments.single.paymentCode, 'PAY-2026-A1');
    });
  });

  group('Patient.fromJson', () {
    test('composes fullName from first/last name', () {
      final patient = Patient.fromJson({
        'id': 9,
        'patient_id': 'PT-2026-Q1',
        'first_name': 'Pooja',
        'last_name': 'Iyer',
        'email': 'patient@demo-hms.test',
      });
      expect(patient.fullName, 'Pooja Iyer');
    });
  });

  group('Prescription.fromJson', () {
    test('parses nested items with medicine names', () {
      final rx = Prescription.fromJson({
        'id': 4,
        'prescription_id': 'RX-2026-1',
        'patient_id': 9,
        'doctor_id': 5,
        'items': [
          {
            'id': 1,
            'medicine': {'name': 'Paracetamol 500mg'},
            'quantity': 10,
            'dosage': '1 tablet',
          },
        ],
      });
      expect(rx.items.single.medicineName, 'Paracetamol 500mg');
      expect(rx.items.single.quantity, 10);
    });
  });
}
