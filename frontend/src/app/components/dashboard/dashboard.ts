import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  user: any = null;
  appointments: any[] = [];
  doctors: any[] = [];
  isLoading: boolean = false;

  showBookModal: boolean = false;
  showRxModal: boolean = false;

  newAppointment = {
    doctorId: '',
    date: '',
    timeSlot: '09:00 AM - 10:00 AM',
    symptoms: ''
  };

  selectedAppointment: any = null;
  prescriptionData = {
    medicines: [{ name: '', dosage: '', frequency: '' }],
    instructions: ''
  };

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.loadAppointments();

    if (this.user?.role?.toLowerCase() === 'patient') {
      this.loadDoctors();
    }
  }

  loadDoctors(): void {
    this.appointmentService.getDoctors().subscribe({
      next: (docs) => {
        this.doctors = Array.isArray(docs) ? docs : [];
        if (this.doctors.length > 0 && !this.newAppointment.doctorId) {
          this.newAppointment.doctorId = this.doctors[0]._id;
        }
      },
      error: () => {
        this.doctors = [];
      }
    });
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.appointmentService.getAppointments().subscribe({
      next: (data) => {
        this.appointments = Array.isArray(data) ? data : [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load appointments:', err);
        this.appointments = [];
        this.isLoading = false;
      }
    });
  }

  getPatientName(apt: any): string {
    if (!apt) return 'Patient';
    if (typeof apt.patient === 'object' && apt.patient?.name) return apt.patient.name;
    return 'Patient';
  }

  getDoctorName(apt: any): string {
    if (!apt) return 'Doctor';
    if (typeof apt.doctor === 'object' && apt.doctor?.name) return apt.doctor.name;
    return 'Doctor';
  }

  updateStatus(id: string, status: string): void {
    this.appointmentService.updateStatus(id, status).subscribe({
      next: () => this.loadAppointments(),
      error: (err) => console.error('Status update failed:', err)
    });
  }

  submitBooking(): void {
    if (!this.newAppointment.doctorId || !this.newAppointment.date) {
      alert('Please select a doctor and date.');
      return;
    }

    this.appointmentService.createAppointment(this.newAppointment).subscribe({
      next: () => {
        this.showBookModal = false;
        this.newAppointment = {
          doctorId: this.doctors[0]?._id || '',
          date: '',
          timeSlot: '09:00 AM - 10:00 AM',
          symptoms: ''
        };
        this.loadAppointments();
      },
      error: (err) => alert(err.error?.message || 'Booking failed')
    });
  }

  openPrescriptionModal(appointment: any): void {
    this.selectedAppointment = appointment;
    this.prescriptionData = {
      medicines: [{ name: '', dosage: '', frequency: '' }],
      instructions: ''
    };
    this.showRxModal = true;
  }

  closePrescriptionModal(): void {
    this.showRxModal = false;
    this.selectedAppointment = null;
  }

  addMedicineRow(): void {
    this.prescriptionData.medicines.push({ name: '', dosage: '', frequency: '' });
  }

  submitPrescription(): void {
    if (!this.selectedAppointment) return;

    const patientId = typeof this.selectedAppointment.patient === 'object'
      ? this.selectedAppointment.patient._id
      : this.selectedAppointment.patient;

    const payload = {
      appointmentId: this.selectedAppointment._id,
      patientId: patientId,
      medicines: this.prescriptionData.medicines,
      instructions: this.prescriptionData.instructions
    };

    this.appointmentService.addPrescription(payload).subscribe({
      next: () => {
        this.closePrescriptionModal();
        this.loadAppointments();
      },
      error: (err) => console.error('Prescription failed:', err)
    });
  }

  get totalAppointmentsCount(): number {
    return this.appointments ? this.appointments.length : 0;
  }

  get completedCount(): number {
    return this.appointments ? this.appointments.filter(a => a.status === 'completed').length : 0;
  }

  get pendingCount(): number {
    return this.appointments ? this.appointments.filter(a => a.status === 'pending').length : 0;
  }

  get totalPatientsCount(): number {
    if (!this.appointments || this.appointments.length === 0) return 0;
    return new Set(this.appointments.map(a => (typeof a.patient === 'object' ? a.patient?._id : a.patient) || a._id)).size;
  }
}