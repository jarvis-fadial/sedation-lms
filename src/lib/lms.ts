import { assessmentQuestions, sedationCases } from '../data/cases';
import type { AssessmentAnswer, LearnerProgress, User } from '../types';

export const defaultUsers: User[] = [
  { id: 'admin-1', name: 'Program Administrator', email: 'admin@sedation.local', password: 'admin123', role: 'admin' },
  { id: 'learner-1', name: 'Alex Learner', email: 'learner@sedation.local', password: 'learn123', role: 'learner' },
];

export const progressKey = 'sedation-lms-progress-v1';
export const usersKey = 'sedation-lms-users-v1';

export function createEmptyProgress(userId: string): LearnerProgress {
  return { userId, enrolledAt: new Date().toISOString(), caseProgress: {}, assessmentAttempts: [] };
}

export function caseCompletionPercent(progress?: LearnerProgress): number {
  if (!progress) return 0;
  const completed = sedationCases.filter((module) => progress.caseProgress[module.id]?.completed).length;
  return Math.round((completed / sedationCases.length) * 100);
}

export function isEligibleForAssessment(progress?: LearnerProgress): boolean {
  return caseCompletionPercent(progress) === 100;
}

export function scoreAssessment(answers: AssessmentAnswer[]) {
  const correct = assessmentQuestions.filter((question) => answers.find((answer) => answer.questionId === question.id)?.answer === question.answer);
  return { correct: correct.length, total: assessmentQuestions.length, percent: Math.round((correct.length / assessmentQuestions.length) * 100), passed: correct.length === assessmentQuestions.length };
}

export function learnerStatus(progress?: LearnerProgress): 'Not enrolled' | 'In progress' | 'Assessment ready' | 'Passed' {
  if (!progress) return 'Not enrolled';
  const lastAttempt = progress.assessmentAttempts.at(-1);
  if (lastAttempt?.score === 100) return 'Passed';
  if (isEligibleForAssessment(progress)) return 'Assessment ready';
  return 'In progress';
}

export function getStoredUsers(): User[] {
  const stored = localStorage.getItem(usersKey);
  if (!stored) return defaultUsers;
  return JSON.parse(stored) as User[];
}

export function saveStoredUsers(users: User[]) {
  localStorage.setItem(usersKey, JSON.stringify(users));
}

export function getStoredProgress(): Record<string, LearnerProgress> {
  const stored = localStorage.getItem(progressKey);
  if (!stored) return { 'learner-1': createEmptyProgress('learner-1') };
  return JSON.parse(stored) as Record<string, LearnerProgress>;
}

export function saveStoredProgress(progress: Record<string, LearnerProgress>) {
  localStorage.setItem(progressKey, JSON.stringify(progress));
}
