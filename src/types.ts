export type Role = 'admin' | 'learner';

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  password: string;
};

export type CaseStep = {
  id: string;
  title: string;
  prompt: string;
  clinicalInfo?: string[];
  question: string;
  options: string[];
  correctOption: string;
  explanation: string;
};

export type SedationCase = {
  id: string;
  title: string;
  patient: string;
  diagnosis: string;
  objective: string[];
  audience: string;
  room: string;
  monitors: string[];
  durationMinutes: number;
  steps: CaseStep[];
};

export type CaseProgress = {
  caseId: string;
  completed: boolean;
  score: number;
  completedAt?: string;
};

export type AssessmentAnswer = {
  questionId: string;
  answer: string;
};

export type LearnerProgress = {
  userId: string;
  enrolledAt: string;
  caseProgress: Record<string, CaseProgress>;
  assessmentAttempts: { score: number; answers: AssessmentAnswer[]; attemptedAt: string }[];
};

export type AssessmentQuestion = {
  id: string;
  caseId: string;
  question: string;
  options: string[];
  answer: string;
  rationale: string;
};
