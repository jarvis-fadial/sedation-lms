import { describe, expect, it } from 'vitest';
import { assessmentQuestions, sedationCases } from '../data/cases';
import { caseCompletionPercent, createEmptyProgress, learnerStatus, scoreAssessment } from './lms';

describe('sedation LMS domain logic', () => {
  it('contains four procedural sedation modules and four assessment questions', () => {
    expect(sedationCases).toHaveLength(4);
    expect(assessmentQuestions).toHaveLength(4);
  });

  it('requires all four assessment questions correct to pass', () => {
    const partial = assessmentQuestions.map((q, index) => ({ questionId: q.id, answer: index === 0 ? q.answer : q.options[0] }));
    const perfect = assessmentQuestions.map((q) => ({ questionId: q.id, answer: q.answer }));
    expect(scoreAssessment(partial).passed).toBe(false);
    expect(scoreAssessment(partial).percent).toBeLessThan(100);
    expect(scoreAssessment(perfect)).toMatchObject({ percent: 100, passed: true });
  });

  it('tracks completion status across modules', () => {
    const progress = createEmptyProgress('learner-1');
    progress.caseProgress['case-1'] = { caseId: 'case-1', completed: true, score: 100 };
    expect(caseCompletionPercent(progress)).toBe(25);
    expect(learnerStatus(progress)).toBe('In progress');
    for (const module of sedationCases) progress.caseProgress[module.id] = { caseId: module.id, completed: true, score: 100 };
    expect(caseCompletionPercent(progress)).toBe(100);
    expect(learnerStatus(progress)).toBe('Assessment ready');
    progress.assessmentAttempts.push({ score: 100, answers: [], attemptedAt: new Date().toISOString() });
    expect(learnerStatus(progress)).toBe('Passed');
  });
});
