# Procedural Sedation LMS Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build an administrator/learner LMS around four procedural sedation simulation cases.

**Architecture:** Vite + React SPA with typed case content, localStorage-backed prototype auth/progress, learner modules, assessment, and admin dashboard. Case data follows u-sim-inspired scenario fields: patient, diagnosis, objectives, room, monitors, timeline actions, and debrief explanations.

**Tech Stack:** React, TypeScript, Vite, Vitest, Tailwind CSS.

---

## Tasks completed

1. Scaffold Vite React app.
2. Extract faculty-guide sedation cases into structured TypeScript data.
3. Add LMS domain helpers and tests for four modules, scoring, and learner status.
4. Implement learner auth, module runner, final assessment, and admin enrollment/status dashboard.
5. Add README and build/test verification.

## Next production hardening

- Replace demo localStorage auth with backend identity provider and server persistence.
- Add password reset and invite emails.
- Add audit/event logs for credentialing documentation.
- Add admin CSV import/export if needed.
- Add richer media support for ETCO2/airway images from original guide if available.
