export enum ApplicationStatus {
  NEW = 'NEW',
  REVIEWING = 'REVIEWING',
  INTERVIEWING = 'INTERVIEWING',
  HIRED = 'HIRED',
  REJECTED = 'REJECTED'
}

export interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  startDate: string;
  endDate: string; // Availability range
  notes: string;
  cvFileName?: string;
  cvUrl?: string; // URL publique du bucket Supabase
  submittedAt: number;
  status: ApplicationStatus;
}

export interface FlyerConfig {
  headline: string;
  subtext: string;
  accentColor: string;
  backgroundImage?: string;
}

export interface ChartData {
  name: string;
  value: number;
}