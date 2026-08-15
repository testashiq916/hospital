import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../models/appointment.dart';
import '../../models/doctor.dart';
import '../../models/hospital.dart';
import '../../providers/appointment_provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_client.dart';
import '../../services/doctor_service.dart';
import '../../utils/formatters.dart';
import '../../widgets/state_views.dart';

/// A four-step booking flow: department -> doctor -> date & slot -> confirm.
///
/// Slot generation is derived client-side from `GET /doctor-schedules`
/// (start/end time + slot_duration for the chosen day of week) rather than
/// from a dedicated "free slots" endpoint, because the backend doesn't
/// expose one beyond `optimal-slot` (which needs `appointments.view`, a
/// permission the seeded patient role doesn't hold — see README). The
/// backend still re-validates on submit (`AppointmentService::book`
/// rejects doctor leave / double-booking), so a slot that looks free here
/// can still come back with a validation error if it was just taken.
class BookAppointmentScreen extends StatefulWidget {
  const BookAppointmentScreen({super.key});

  @override
  State<BookAppointmentScreen> createState() => _BookAppointmentScreenState();
}

class _BookAppointmentScreenState extends State<BookAppointmentScreen> {
  late final DoctorService _doctorService;

  int _step = 0;
  bool _loadingDoctors = true;
  String? _loadError;

  List<Department> _departments = [];
  List<Doctor> _allDoctors = [];
  Department? _selectedDepartment;
  Doctor? _selectedDoctor;

  DateTime _selectedDate =
      DateTime.now().add(const Duration(days: 1)); // tomorrow, sensible default
  List<DoctorSchedule> _schedules = [];
  bool _loadingSchedules = false;
  String? _selectedSlot; // 'HH:mm:ss'
  DoctorSchedule? _slotSchedule;

  final _reasonController = TextEditingController();
  bool _submitting = false;
  Appointment? _bookedAppointment;

  @override
  void initState() {
    super.initState();
    _doctorService = DoctorService(context.read<AuthProvider>().client);
    _loadDoctors();
  }

  @override
  void dispose() {
    _reasonController.dispose();
    super.dispose();
  }

  Future<void> _loadDoctors() async {
    setState(() {
      _loadingDoctors = true;
      _loadError = null;
    });
    try {
      final results = await Future.wait([
        _doctorService.departments(),
        _doctorService.doctors(),
      ]);
      setState(() {
        _departments = results[0] as List<Department>;
        _allDoctors = results[1] as List<Doctor>;
      });
    } on ApiException catch (e) {
      setState(() => _loadError = e.displayMessage);
    } catch (e) {
      setState(() => _loadError = 'Failed to load doctors: $e');
    } finally {
      setState(() => _loadingDoctors = false);
    }
  }

  List<Doctor> get _filteredDoctors {
    if (_selectedDepartment == null) return _allDoctors;
    final dept = _selectedDepartment!.name.toLowerCase();
    return _allDoctors
        .where((d) =>
            (d.specialization ?? '').toLowerCase().contains(dept) ||
            dept.contains((d.specialization ?? '__none__').toLowerCase()))
        .toList();
  }

  Future<void> _loadSchedulesFor(Doctor doctor) async {
    setState(() {
      _loadingSchedules = true;
      _schedules = [];
      _selectedSlot = null;
    });
    try {
      final schedules = await _doctorService.schedules(doctor.id);
      setState(() => _schedules = schedules);
    } on ApiException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.displayMessage)));
      }
    } finally {
      if (mounted) setState(() => _loadingSchedules = false);
    }
  }

  List<String> _slotsForDate(DateTime date) {
    final dayName = _dayOfWeekName(date.weekday);
    final match = _schedules.where(
      (s) => s.dayOfWeek == dayName && s.isAvailable,
    );
    if (match.isEmpty) return [];
    final schedule = match.first;
    _slotSchedule = schedule;

    final slots = <String>[];
    final start = _parseTimeOfDay(schedule.startTime);
    final end = _parseTimeOfDay(schedule.endTime);
    if (start == null || end == null) return [];

    var cursor = DateTime(2000, 1, 1, start.hour, start.minute);
    final endDt = DateTime(2000, 1, 1, end.hour, end.minute);
    final duration = Duration(minutes: schedule.slotDuration <= 0 ? 15 : schedule.slotDuration);
    var count = 0;
    while (cursor.isBefore(endDt) && count < schedule.maxPatients) {
      slots.add(
        '${cursor.hour.toString().padLeft(2, '0')}:${cursor.minute.toString().padLeft(2, '0')}:00',
      );
      cursor = cursor.add(duration);
      count++;
    }
    return slots;
  }

  TimeOfDay? _parseTimeOfDay(String raw) {
    final parts = raw.split(':');
    if (parts.length < 2) return null;
    final h = int.tryParse(parts[0]);
    final m = int.tryParse(parts[1]);
    if (h == null || m == null) return null;
    return TimeOfDay(hour: h, minute: m);
  }

  String _dayOfWeekName(int weekday) {
    const names = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
    return names[(weekday - 1) % 7];
  }

  Future<void> _submit() async {
    final auth = context.read<AuthProvider>();
    final patient = auth.patient;
    final doctor = _selectedDoctor;
    final slot = _selectedSlot;
    if (patient == null || doctor == null || slot == null) return;
    final hospitalId = auth.user?.hospitalId;
    if (hospitalId == null) return;

    setState(() => _submitting = true);
    try {
      final appointment = await context.read<AppointmentProvider>().book(
            hospitalId: hospitalId,
            patientId: patient.id,
            doctorId: doctor.id,
            date: _selectedDate,
            time: slot,
            reason: _reasonController.text.trim(),
            isTeleconsultation: false,
          );
      setState(() => _bookedAppointment = appointment);
    } on ApiException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.displayMessage)));
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    if (auth.patient == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Book Appointment')),
        body: const EmptyView(
          message: 'Link your patient profile from the Home tab before '
              'booking an appointment.',
          icon: Icons.link_off_rounded,
        ),
      );
    }

    if (_bookedAppointment != null) {
      return _BookingConfirmedView(appointment: _bookedAppointment!);
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Book Appointment')),
      body: _loadingDoctors
          ? const LoadingView()
          : _loadError != null
              ? ErrorView(message: _loadError!, onRetry: _loadDoctors)
              : Stepper(
                  currentStep: _step,
                  onStepContinue: _canContinue() ? _advance : null,
                  onStepCancel: _step == 0 ? null : () => setState(() => _step--),
                  controlsBuilder: (context, details) => Padding(
                    padding: const EdgeInsets.only(top: 16),
                    child: Row(
                      children: [
                        if (_step == 3)
                          Expanded(
                            child: ElevatedButton(
                              onPressed: _submitting ? null : _submit,
                              child: _submitting
                                  ? const SizedBox(
                                      height: 20,
                                      width: 20,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2.4,
                                        valueColor: AlwaysStoppedAnimation(
                                            Colors.white),
                                      ),
                                    )
                                  : const Text('Confirm booking'),
                            ),
                          )
                        else
                          Expanded(
                            child: ElevatedButton(
                              onPressed: details.onStepContinue,
                              child: const Text('Continue'),
                            ),
                          ),
                        if (_step > 0) ...[
                          const SizedBox(width: 12),
                          Expanded(
                            child: OutlinedButton(
                              onPressed: details.onStepCancel,
                              child: const Text('Back'),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  steps: [
                    Step(
                      title: const Text('Department'),
                      isActive: _step >= 0,
                      state: _step > 0 ? StepState.complete : StepState.indexed,
                      content: _DepartmentStep(
                        departments: _departments,
                        selected: _selectedDepartment,
                        onSelect: (d) => setState(() {
                          _selectedDepartment = d;
                          _selectedDoctor = null;
                        }),
                      ),
                    ),
                    Step(
                      title: const Text('Doctor'),
                      isActive: _step >= 1,
                      state: _step > 1 ? StepState.complete : StepState.indexed,
                      content: _DoctorStep(
                        doctors: _filteredDoctors,
                        selected: _selectedDoctor,
                        onSelect: (d) {
                          setState(() => _selectedDoctor = d);
                          _loadSchedulesFor(d);
                        },
                      ),
                    ),
                    Step(
                      title: const Text('Date & Slot'),
                      isActive: _step >= 2,
                      state: _step > 2 ? StepState.complete : StepState.indexed,
                      content: _SlotStep(
                        selectedDate: _selectedDate,
                        loading: _loadingSchedules,
                        slots: _loadingSchedules ? [] : _slotsForDate(_selectedDate),
                        selectedSlot: _selectedSlot,
                        onDateChanged: (date) => setState(() {
                          _selectedDate = date;
                          _selectedSlot = null;
                        }),
                        onSlotSelected: (slot) =>
                            setState(() => _selectedSlot = slot),
                      ),
                    ),
                    Step(
                      title: const Text('Confirm'),
                      isActive: _step >= 3,
                      state: StepState.indexed,
                      content: _ConfirmStep(
                        doctor: _selectedDoctor,
                        schedule: _slotSchedule,
                        date: _selectedDate,
                        slot: _selectedSlot,
                        reasonController: _reasonController,
                      ),
                    ),
                  ],
                ),
    );
  }

  bool _canContinue() {
    switch (_step) {
      case 0:
        return true; // department optional
      case 1:
        return _selectedDoctor != null;
      case 2:
        return _selectedSlot != null;
      default:
        return false;
    }
  }

  void _advance() {
    if (_step < 3) setState(() => _step++);
  }
}

class _DepartmentStep extends StatelessWidget {
  const _DepartmentStep({
    required this.departments,
    required this.selected,
    required this.onSelect,
  });

  final List<Department> departments;
  final Department? selected;
  final void Function(Department?) onSelect;

  @override
  Widget build(BuildContext context) {
    if (departments.isEmpty) {
      return const Text(
        'No departments configured — you can still pick any doctor next.',
        style: TextStyle(color: Color(0xFF64748B)),
      );
    }
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        ChoiceChip(
          label: const Text('All'),
          selected: selected == null,
          onSelected: (_) => onSelect(null),
        ),
        ...departments.map(
          (d) => ChoiceChip(
            label: Text(d.name),
            selected: selected?.id == d.id,
            onSelected: (_) => onSelect(d),
          ),
        ),
      ],
    );
  }
}

class _DoctorStep extends StatelessWidget {
  const _DoctorStep({
    required this.doctors,
    required this.selected,
    required this.onSelect,
  });

  final List<Doctor> doctors;
  final Doctor? selected;
  final void Function(Doctor) onSelect;

  @override
  Widget build(BuildContext context) {
    if (doctors.isEmpty) {
      return const Text(
        'No doctors found for this department.',
        style: TextStyle(color: Color(0xFF64748B)),
      );
    }
    return Column(
      children: doctors
          .map(
            (d) => Card(
              color: selected?.id == d.id
                  ? AppTheme.primary.withValues(alpha: 0.06)
                  : null,
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: AppTheme.primary.withValues(alpha: 0.1),
                  child: Text(
                    d.name.isNotEmpty ? d.name[0].toUpperCase() : 'D',
                    style: const TextStyle(color: AppTheme.primary),
                  ),
                ),
                title: Text(d.name),
                subtitle: Text(
                  [d.specialization, d.designation]
                      .where((s) => s != null && s.isNotEmpty)
                      .join(' • '),
                ),
                trailing: selected?.id == d.id
                    ? const Icon(Icons.check_circle_rounded,
                        color: AppTheme.primary)
                    : null,
                onTap: () => onSelect(d),
              ),
            ),
          )
          .toList(),
    );
  }
}

class _SlotStep extends StatelessWidget {
  const _SlotStep({
    required this.selectedDate,
    required this.loading,
    required this.slots,
    required this.selectedSlot,
    required this.onDateChanged,
    required this.onSlotSelected,
  });

  final DateTime selectedDate;
  final bool loading;
  final List<String> slots;
  final String? selectedSlot;
  final void Function(DateTime) onDateChanged;
  final void Function(String) onSlotSelected;

  @override
  Widget build(BuildContext context) {
    final days = List.generate(14, (i) => DateTime.now().add(Duration(days: i + 1)));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          height: 72,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: days.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (context, i) {
              final day = days[i];
              final isSelected = day.year == selectedDate.year &&
                  day.month == selectedDate.month &&
                  day.day == selectedDate.day;
              return InkWell(
                borderRadius: BorderRadius.circular(12),
                onTap: () => onDateChanged(day),
                child: Container(
                  width: 56,
                  decoration: BoxDecoration(
                    color: isSelected ? AppTheme.primary : Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSelected
                          ? AppTheme.primary
                          : const Color(0xFFE2E8F0),
                    ),
                  ),
                  alignment: Alignment.center,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        DateFormat('EEE').format(day),
                        style: TextStyle(
                          fontSize: 11,
                          color: isSelected ? Colors.white70 : const Color(0xFF64748B),
                        ),
                      ),
                      Text(
                        '${day.day}',
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 16,
                          color: isSelected ? Colors.white : Colors.black87,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 16),
        if (loading)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 24),
            child: Center(child: CircularProgressIndicator()),
          )
        else if (slots.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 16),
            child: Text(
              'Doctor is not scheduled on this day. Try another date.',
              style: TextStyle(color: Color(0xFF64748B)),
            ),
          )
        else
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: slots.map((slot) {
              final selected = slot == selectedSlot;
              return ChoiceChip(
                label: Text(Formatters.time(slot)),
                selected: selected,
                onSelected: (_) => onSlotSelected(slot),
              );
            }).toList(),
          ),
      ],
    );
  }
}

class _ConfirmStep extends StatelessWidget {
  const _ConfirmStep({
    required this.doctor,
    required this.schedule,
    required this.date,
    required this.slot,
    required this.reasonController,
  });

  final Doctor? doctor;
  final DoctorSchedule? schedule;
  final DateTime date;
  final String? slot;
  final TextEditingController reasonController;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(doctor?.name ?? '—',
                    style: const TextStyle(fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                Text('${Formatters.dateLong(date)} • ${Formatters.time(slot)}',
                    style: const TextStyle(color: Color(0xFF64748B))),
                if (schedule?.consultationFee != null) ...[
                  const SizedBox(height: 8),
                  Text(
                    'Consultation fee: ${Formatters.currency(schedule!.consultationFee!)}',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                ],
              ],
            ),
          ),
        ),
        const SizedBox(height: 14),
        TextField(
          controller: reasonController,
          maxLines: 3,
          decoration: const InputDecoration(
            labelText: 'Reason for visit (optional)',
            alignLabelWithHint: true,
          ),
        ),
      ],
    );
  }
}

class _BookingConfirmedView extends StatelessWidget {
  const _BookingConfirmedView({required this.appointment});

  final Appointment appointment;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(automaticallyImplyLeading: false),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: AppTheme.success.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check_rounded,
                    color: AppTheme.success, size: 40),
              ),
              const SizedBox(height: 20),
              const Text(
                'Appointment booked!',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 8),
              Text(
                '${Formatters.dateLong(appointment.appointmentDate)} at '
                '${Formatters.time(appointment.appointmentTime)}',
                textAlign: TextAlign.center,
                style: const TextStyle(color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
                decoration: BoxDecoration(
                  color: AppTheme.primary.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  children: [
                    const Text('Your token number',
                        style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                    Text(
                      '#${appointment.tokenNumber ?? '—'}',
                      style: const TextStyle(
                        fontSize: 36,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.primary,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () =>
                      Navigator.of(context).popUntil((r) => r.isFirst),
                  child: const Text('Done'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
