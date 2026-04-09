# Research Roadmap

This document defines the order of work for turning the current prototype into a strong academic project submission.

## Phase 1: Reproducibility Foundation

### Goal

Make the project runnable by another student, supervisor, or evaluator without guessing hidden setup steps.

### Why this matters

In research, a project is weak if it works only on the creator's machine. Reproducibility is the first quality filter before novelty, experiments, or presentation.

### Required outcomes

- supported Node and Python versions are documented
- setup steps are clear
- deployment steps are repeatable
- tests can be run consistently
- environment variables are documented

### Checklist

- [x] Define supported Node version
- [x] Add useful project scripts
- [x] Replace starter README
- [ ] Run Hardhat tests on a supported Node version
- [ ] Verify clean setup from scratch

## Phase 2: Functional Validation

### Goal

Prove that the system does what it claims to do.

### Core claims to validate

1. Only valid devices can be authenticated.
2. Only registered and authenticated devices can store provenance records.
3. A correct reading can be verified successfully.
4. A modified reading fails verification.
5. Deauthenticated devices lose the ability to continue trusted submission.

### Required outcomes

- all contract unit tests pass
- simulator demo works end to end
- at least one integration workflow is documented

### Checklist

- [x] Registration flow works
- [x] Authentication flow works
- [x] Deauthentication flow works
- [x] Data hash storage works
- [x] Provenance verification works
- [ ] Add explicit end-to-end integration tests
- [ ] Add deauthenticated-device data submission test

## Phase 3: Security and Threat Model

### Goal

Define exactly what security problem this system solves and what it does not solve.

### Why this matters

Research projects become much stronger when they clearly separate:

- attack surface,
- security guarantees,
- limitations.

### Threats currently addressed

- duplicate device registration
- unauthorized authentication attempts
- unauthorized data submission
- post-generation data tampering

### Threats not yet addressed

- private key theft
- malicious or physically compromised sensor hardware
- fake readings produced before hashing
- privacy leakage from metadata
- decentralized identity and key rotation

### Required outcomes

- one short threat-model section in report
- one architecture diagram showing trust boundaries
- one sequence diagram for registration and provenance verification

## Phase 4: Evaluation and Measurement

### Goal

Generate evidence, not just a demo.

### Why this matters

A research submission is stronger when it answers:

- How much gas does each operation consume?
- How long does each operation take?
- What happens as records increase?

### Metrics to collect

#### Correctness metrics

- registration success/failure cases
- authentication success/failure cases
- provenance verification accuracy

#### Blockchain cost metrics

- gas for `registerIoTDevice`
- gas for `authenticateIoTDevice`
- gas for `deauthenticateIoTDevice`
- gas for `storeDataHash`

#### Performance metrics

- average time to submit a transaction
- average time to verify provenance
- throughput across multiple rounds or devices

#### Scalability indicators

- growth in data count per device
- effect of repeated writes
- relative cost stability over multiple iterations

### Suggested experiment set

1. Run 10 registrations and record gas and time.
2. Run 10 authentications and record gas and time.
3. Run 10 data submissions per device for 3 devices.
4. Verify original and tampered readings for selected indexes.
5. Record averages in a simple results table.

### Required outcomes

- one results table
- one discussion section interpreting the values
- one limitations section explaining local-chain assumptions

## Phase 5: Scope Discipline

### Goal

Avoid weakening the project by spreading effort across unfinished extras.

### Recommendation

Treat the following as the primary submission scope:

- Solidity contracts
- Hardhat tests
- Python simulator
- provenance verification
- evaluation and report

Treat the following as optional or future work unless your course explicitly requires them:

- backend API
- frontend dashboard
- advanced wallet integrations
- cloud deployment

## Phase 6: Final Submission Package

### Goal

Produce a complete project package that looks academically mature.

### Deliverables

- working codebase
- reproducible setup guide
- architecture diagram
- sequence diagram
- threat model
- experiment results
- discussion and limitations
- conclusion and future work

## Recommended Immediate Next Tasks

1. Upgrade local Node to a supported version and rerun `npm test`.
2. Fix any failing contract or environment issues until tests pass.
3. Add one end-to-end integration test for register -> authenticate -> store -> verify.
4. Add a gas-measurement script or documented method.
5. Decide whether backend/frontend are in scope for the final submission.
