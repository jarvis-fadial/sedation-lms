# Procedural Sedation Simulation LMS

Interactive LMS for four procedural/deep-sedation cases from the provided faculty guide.

## Demo credentials

- Administrator: `admin@sedation.local` / `admin123`
- Learner: `learner@sedation.local` / `learn123`

## Features

- Learner authentication and module dashboard.
- Administrator enrollment workflow and learner-progress dashboard.
- Four interactive procedural sedation modules, structured around u-sim concepts: scenario, patient, action timeline, objectives, room, monitors, and debrief explanations.
- Four-question final assessment; 100% required to pass.
- Failed assessment attempts reveal answer rationales for review and retry.
- Local browser persistence via `localStorage` for the prototype.

## Development

```bash
npm install
npm run dev
npm test
npm run build
```

## Production notes

This is a working front-end prototype. For institutional deployment, replace localStorage demo auth with a server-backed identity/enrollment store, password hashing, audit logs, role-based routes, and protected persistence.
