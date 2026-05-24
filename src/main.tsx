import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, BookOpenCheck, CheckCircle2, ClipboardList, LogOut, ShieldCheck, Users } from 'lucide-react';
import { assessmentQuestions, generalNotes, sedationCases } from './data/cases';
import { caseCompletionPercent, createEmptyProgress, defaultUsers, getStoredProgress, getStoredUsers, isEligibleForAssessment, learnerStatus, saveStoredProgress, saveStoredUsers, scoreAssessment } from './lib/lms';
import type { AssessmentAnswer, CaseStep, LearnerProgress, SedationCase, User } from './types';
import './index.css';

type Screen = 'overview' | 'module' | 'assessment' | 'admin';

function App() {
  const [users, setUsers] = useState<User[]>(getStoredUsers);
  const [progress, setProgress] = useState<Record<string, LearnerProgress>>(getStoredProgress);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<Screen>('overview');
  const [activeCaseId, setActiveCaseId] = useState(sedationCases[0].id);

  const activeProgress = currentUser ? progress[currentUser.id] : undefined;
  const activeCase = sedationCases.find((item) => item.id === activeCaseId) ?? sedationCases[0];

  function persistProgress(next: Record<string, LearnerProgress>) {
    setProgress(next);
    saveStoredProgress(next);
  }

  function persistUsers(next: User[]) {
    setUsers(next);
    saveStoredUsers(next);
  }

  if (!currentUser) return <Login users={users} onLogin={(user) => { setCurrentUser(user); setScreen(user.role === 'admin' ? 'admin' : 'overview'); }} />;

  return (
    <div className="shell">
      <header className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="badge"><ShieldCheck size={15}/> Procedural Sedation LMS</div>
          <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Deep sedation simulation modules</h1>
          <p className="mt-2 max-w-3xl text-stone-600">Interactive learner modules adapted from the provided faculty guide and organized with the u-sim scenario pattern: patient, objectives, timeline actions, debrief, and assessment.</p>
        </div>
        <div className="card flex items-center gap-3 px-4 py-3">
          <div><div className="font-bold">{currentUser.name}</div><div className="text-sm text-stone-500">{currentUser.role}</div></div>
          <button className="btn btn-secondary" onClick={() => setCurrentUser(null)}><LogOut size={16}/></button>
        </div>
      </header>

      <nav className="mx-auto flex max-w-7xl flex-wrap gap-2 px-6 pb-4">
        {currentUser.role === 'learner' && <button className={`btn ${screen === 'overview' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setScreen('overview')}>Learner dashboard</button>}
        {currentUser.role === 'learner' && <button className={`btn ${screen === 'assessment' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setScreen('assessment')}>Final assessment</button>}
        {currentUser.role === 'admin' && <button className={`btn ${screen === 'admin' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setScreen('admin')}>Administrator</button>}
      </nav>

      <main className="mx-auto max-w-7xl px-6 pb-12">
        {screen === 'overview' && <LearnerOverview progress={activeProgress} onStart={(caseId) => { setActiveCaseId(caseId); setScreen('module'); }} />}
        {screen === 'module' && <ModuleRunner module={activeCase} progress={activeProgress ?? createEmptyProgress(currentUser.id)} onBack={() => setScreen('overview')} onComplete={(caseId, score) => persistProgress({ ...progress, [currentUser.id]: { ...(activeProgress ?? createEmptyProgress(currentUser.id)), caseProgress: { ...(activeProgress?.caseProgress ?? {}), [caseId]: { caseId, completed: true, score, completedAt: new Date().toISOString() } } } })} />}
        {screen === 'assessment' && <Assessment progress={activeProgress} onSubmit={(answers, score) => persistProgress({ ...progress, [currentUser.id]: { ...(activeProgress ?? createEmptyProgress(currentUser.id)), assessmentAttempts: [...(activeProgress?.assessmentAttempts ?? []), { score, answers, attemptedAt: new Date().toISOString() }] } })} />}
        {screen === 'admin' && <AdminDashboard users={users} progress={progress} onEnroll={(name, email) => { const user: User = { id: crypto.randomUUID(), name, email, password: 'learn123', role: 'learner' }; persistUsers([...users, user]); persistProgress({ ...progress, [user.id]: createEmptyProgress(user.id) }); }} />}
      </main>
    </div>
  );
}

function Login({ users, onLogin }: { users: User[]; onLogin: (user: User) => void }) {
  const [email, setEmail] = useState('learner@sedation.local');
  const [password, setPassword] = useState('learn123');
  const [error, setError] = useState('');
  function submit(event: React.FormEvent) {
    event.preventDefault();
    const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password) ?? defaultUsers.find((item) => item.email === email && item.password === password);
    if (!user) return setError('Invalid demo credentials. Try learner@sedation.local / learn123 or admin@sedation.local / admin123.');
    onLogin(user);
  }
  return <div className="shell grid min-h-screen place-items-center px-6"><form className="card w-full max-w-md p-8" onSubmit={submit}><div className="badge"><BookOpenCheck size={15}/> LMS login</div><h1 className="mt-4 text-3xl font-black">Sedation credentialing simulation</h1><p className="mt-2 text-stone-600">Demo accounts: learner@sedation.local / learn123, admin@sedation.local / admin123.</p><label className="mt-6 block text-sm font-bold">Email</label><input className="input mt-2" value={email} onChange={(e) => setEmail(e.target.value)} /><label className="mt-4 block text-sm font-bold">Password</label><input className="input mt-2" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />{error && <p className="mt-3 text-sm font-bold text-red-700">{error}</p>}<button className="btn btn-primary mt-6 w-full">Sign in</button></form></div>;
}

function LearnerOverview({ progress, onStart }: { progress?: LearnerProgress; onStart: (caseId: string) => void }) {
  const percent = caseCompletionPercent(progress);
  return <div className="grid gap-6 lg:grid-cols-[1.3fr_.7fr]"><section className="card p-6"><div className="flex items-center justify-between"><h2 className="text-2xl font-black">Learner progress</h2><span className="badge"><Activity size={15}/>{percent}% complete</span></div><div className="progressbar mt-4"><div style={{ width: `${percent}%` }} /></div><div className="mt-6 grid gap-4 md:grid-cols-2">{sedationCases.map((module) => <article className="rounded-3xl border border-stone-200 bg-white p-5" key={module.id}><div className="flex items-start justify-between gap-3"><h3 className="font-black">{module.title}</h3>{progress?.caseProgress[module.id]?.completed && <CheckCircle2 className="text-green-700"/>}</div><p className="mt-2 text-sm text-stone-600">{module.patient}</p><p className="mt-3 text-sm"><b>u-sim fields:</b> {module.room}; {module.monitors.join(', ')}; {module.durationMinutes} min</p><button className="btn btn-primary mt-4" onClick={() => onStart(module.id)}>{progress?.caseProgress[module.id]?.completed ? 'Review module' : 'Start module'}</button></article>)}</div></section><aside className="card p-6"><h2 className="text-xl font-black">Core policy notes</h2><ul className="mt-4 space-y-3 text-sm text-stone-700">{generalNotes.map((note) => <li key={note}>• {note}</li>)}</ul></aside></div>;
}

function ModuleRunner({ module, progress, onBack, onComplete }: { module: SedationCase; progress: LearnerProgress; onBack: () => void; onComplete: (caseId: string, score: number) => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const step = module.steps[stepIndex];
  const answeredCorrectly = answers[step.id] === step.correctOption;
  const completed = stepIndex === module.steps.length - 1 && answeredCorrectly;
  const score = Math.round((module.steps.filter((s) => answers[s.id] === s.correctOption).length / module.steps.length) * 100);
  return <section className="card p-6"><button className="btn btn-secondary" onClick={onBack}>← Back</button><div className="mt-4 grid gap-6 lg:grid-cols-[.8fr_1.2fr]"><aside className="rounded-3xl bg-stone-900 p-5 text-white"><div className="badge bg-white/10 text-white">{module.diagnosis}</div><h2 className="mt-4 text-2xl font-black">{module.title}</h2><p className="mt-3 text-stone-200">{module.patient}</p><h3 className="mt-5 font-bold">Objectives</h3><ul className="mt-2 space-y-2 text-sm text-stone-200">{module.objective.map((objective) => <li key={objective}>• {objective}</li>)}</ul><div className="mt-5 text-sm text-stone-300">Step {stepIndex + 1} of {module.steps.length} · Score {score}%</div></aside><div><StepCard step={step} selected={answers[step.id]} onSelect={(answer) => setAnswers({ ...answers, [step.id]: answer })} />{answers[step.id] && <div className={`mt-4 rounded-3xl p-4 ${answeredCorrectly ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'}`}><b>{answeredCorrectly ? 'Correct.' : 'Review.'}</b> {step.explanation}</div>}<div className="mt-5 flex gap-2"><button className="btn btn-secondary" disabled={stepIndex === 0} onClick={() => setStepIndex(Math.max(0, stepIndex - 1))}>Previous</button>{!completed && <button className="btn btn-primary" disabled={!answeredCorrectly} onClick={() => setStepIndex(Math.min(module.steps.length - 1, stepIndex + 1))}>Next</button>}{completed && <button className="btn btn-primary" onClick={() => { onComplete(module.id, score); onBack(); }}>Complete module</button>}</div>{progress.caseProgress[module.id]?.completed && <p className="mt-3 text-sm text-green-800">Previously completed on {new Date(progress.caseProgress[module.id].completedAt ?? '').toLocaleString()}.</p>}</div></div></section>;
}

function StepCard({ step, selected, onSelect }: { step: CaseStep; selected?: string; onSelect: (answer: string) => void }) {
  return <div><div className="badge"><ClipboardList size={15}/>{step.title}</div><p className="mt-4 whitespace-pre-wrap text-lg leading-relaxed text-stone-700">{step.prompt}</p><h3 className="mt-6 text-xl font-black">{step.question}</h3><div className="mt-4 grid gap-3">{step.options.map((option) => <button key={option} className={`rounded-2xl border p-4 text-left font-semibold ${selected === option ? 'border-red-700 bg-red-50' : 'border-stone-200 bg-white hover:bg-stone-50'}`} onClick={() => onSelect(option)}>{option}</button>)}</div></div>;
}

function Assessment({ progress, onSubmit }: { progress?: LearnerProgress; onSubmit: (answers: AssessmentAnswer[], score: number) => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const result = useMemo(() => scoreAssessment(Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }))), [answers]);
  if (!isEligibleForAssessment(progress)) return <section className="card p-6"><h2 className="text-2xl font-black">Final assessment locked</h2><p className="mt-2 text-stone-600">Complete all four interactive sedation cases before attempting the final assessment.</p></section>;
  const last = progress?.assessmentAttempts.at(-1);
  return <section className="card p-6"><h2 className="text-2xl font-black">Final assessment: 4 questions, 100% required</h2>{last && <p className="mt-2 font-bold">Last attempt: {last.score}% {last.score === 100 ? '— passed' : '— review answers and retry'}</p>}<div className="mt-6 space-y-6">{assessmentQuestions.map((question, index) => <div className="rounded-3xl border border-stone-200 bg-white p-5" key={question.id}><h3 className="font-black">{index + 1}. {question.question}</h3><div className="mt-3 grid gap-2">{question.options.map((option) => <button key={option} className={`rounded-2xl border p-3 text-left ${answers[question.id] === option ? 'border-red-700 bg-red-50' : 'border-stone-200'}`} onClick={() => setAnswers({ ...answers, [question.id]: option })}>{option}</button>)}</div>{last && last.score < 100 && <p className="mt-3 text-sm text-stone-700"><b>Answer:</b> {question.answer}. {question.rationale}</p>}</div>)}</div><button className="btn btn-primary mt-6" disabled={Object.keys(answers).length !== assessmentQuestions.length} onClick={() => onSubmit(Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })), result.percent)}>Submit assessment ({result.percent}%)</button>{Object.keys(answers).length === assessmentQuestions.length && <p className="mt-3 font-bold">Current score: {result.percent}% — {result.passed ? 'pass ready' : 'must be 100%; review and retry if submitted.'}</p>}</section>;
}

function AdminDashboard({ users, progress, onEnroll }: { users: User[]; progress: Record<string, LearnerProgress>; onEnroll: (name: string, email: string) => void }) {
  const [name, setName] = useState('New Learner');
  const [email, setEmail] = useState('new.learner@sedation.local');
  const learners = users.filter((user) => user.role === 'learner');
  return <section className="grid gap-6 lg:grid-cols-[.7fr_1.3fr]"><form className="card p-6" onSubmit={(event) => { event.preventDefault(); onEnroll(name, email); }}><div className="badge"><Users size={15}/> Administrator</div><h2 className="mt-4 text-2xl font-black">Enroll learner</h2><p className="mt-2 text-sm text-stone-600">Demo enrollment creates a learner with password <b>learn123</b> and starts progress tracking.</p><label className="mt-5 block text-sm font-bold">Name</label><input className="input mt-2" value={name} onChange={(e) => setName(e.target.value)} /><label className="mt-4 block text-sm font-bold">Email</label><input className="input mt-2" value={email} onChange={(e) => setEmail(e.target.value)} /><button className="btn btn-primary mt-5">Enroll</button></form><div className="card overflow-hidden p-6"><h2 className="text-2xl font-black">Learner status dashboard</h2><div className="mt-5 grid gap-3">{learners.map((learner) => { const learnerProgress = progress[learner.id]; const percent = caseCompletionPercent(learnerProgress); return <div className="rounded-3xl border border-stone-200 bg-white p-5" key={learner.id}><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="font-black">{learner.name}</div><div className="text-sm text-stone-500">{learner.email}</div></div><span className="badge">{learnerStatus(learnerProgress)}</span></div><div className="progressbar mt-4"><div style={{ width: `${percent}%` }} /></div><div className="mt-3 grid gap-2 text-sm md:grid-cols-4">{sedationCases.map((module) => <span key={module.id}>{module.id}: {learnerProgress?.caseProgress[module.id]?.completed ? '✓' : '—'}</span>)}</div><p className="mt-3 text-sm font-bold">Assessment attempts: {learnerProgress?.assessmentAttempts.length ?? 0}; best score: {Math.max(0, ...(learnerProgress?.assessmentAttempts.map((attempt) => attempt.score) ?? []))}%</p></div>; })}</div></div></section>;
}

createRoot(document.getElementById('root')!).render(<App />);
