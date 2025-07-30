
export interface User {
  id: string;
  username: string;
  password?: string; // Should not be stored long-term, used for creation/login
  role: 'admin' | 'student';
  firstName: string;
  lastName: string;
  age?: number;
  documentNumber?: string;
  phone?: string;
  address?: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface Exam {
  id:number;
  title: string;
  class?: string;
  description?: string;
  dateTime: string; // ISO string format
  questions: Question[];
  isEnabled: boolean;
  allowedStudentIds: string[];
  isActivo:boolean;
}

export interface Submission {
  id: string;
  examId: string;
  studentId: string;
  answers: number[]; // Array of selected option indices
  score: number; // Percentage
  submittedAt: string; // ISO string format
}
