# Evaluation Guide

This guide explains how to evaluate the blockchain-based IoT authentication and provenance prototype in a research-style way.

## Why evaluation matters

A blockchain project is not strong just because it runs successfully once. A stronger project shows:

- correctness,
- security behavior,
- gas cost,
- latency,
- repeatability.

Your contracts and simulator already demonstrate correctness at a prototype level. The purpose of evaluation is to convert that working prototype into measurable evidence.

## What we want to measure

### 1. Functional correctness

These questions check whether the system behaves as intended:

- Can a new device register successfully?
- Can only the owner authenticate the device?
- Can only authenticated devices store data hashes?
- Does provenance verification succeed for the original reading?
- Does provenance verification fail for a tampered reading?

### 2. Gas cost

Gas is the unit of computational work on Ethereum-compatible blockchains. In your project, it answers:

- how expensive is device registration?
- how expensive is device authentication?
- how expensive is deauthentication?
- how expensive is storing a provenance hash?

Gas does not directly tell you real-money cost unless you multiply it by gas price, but it is still the standard metric for smart-contract efficiency.

### 3. Latency

Latency measures how long an operation takes to finish.

For your local prototype, latency helps compare:

- write operations that require transactions,
- read operations that do not modify state,
- provenance verification flow.

Important:

- localhost latency is useful for relative comparison inside the project
- it is not a substitute for public-chain benchmarking

## Evaluation workflow

### Step 1. Start the local Hardhat node

```bash
npm run node
```

### Step 2. Run the automated evaluation script

In another terminal:

```bash
npm run evaluate:local
```

Optional:

```bash
EVAL_ITERATIONS=5 npm run evaluate:local
```

This script:

- deploys fresh contracts,
- executes registration/authentication/store/deauthentication,
- measures gas usage,
- measures latency,
- checks original and tampered provenance conditions.

## How to interpret the output

### Gas used

Higher gas means more blockchain computation and storage cost.

Expected pattern in your system:

- `registerIoTDevice` should cost moderate gas
- `authenticateIoTDevice` should cost less than registration
- `storeDataHash` should also be meaningful because it appends a record
- `deauthenticateIoTDevice` should generally be lighter than registration

### Latency

Write operations include:

- sending a transaction,
- mining it,
- receiving the receipt.

Read operations usually complete much faster because they do not create blocks.

### Verification outcome

The evaluation script checks two cases:

- original reading should verify as valid
- tampered reading should verify as invalid

If both do not happen, the provenance claim is not supported.

## What to include in your report

### Suggested table

| Operation | Average Gas Used | Average Latency (ms) | Notes |
|---|---:|---:|---|
| registerIoTDevice | ... | ... | Device onboarding |
| authenticateIoTDevice | ... | ... | Authorization step |
| storeDataHash | ... | ... | Provenance write |
| deauthenticateIoTDevice | ... | ... | State revocation |
| getDeviceDataHash | N/A | ... | Read-only provenance lookup |

### Suggested interpretation points

- Which operation is most expensive?
- Which operations are lightweight enough for repeated use?
- Why is storing only hashes better than storing full data on-chain?
- Why is local latency not equal to real blockchain latency?
- What tradeoff exists between immutability and scalability?

## Limitations to state honestly

- Measurements are taken on a local Hardhat network.
- Real public blockchain costs and latency will differ.
- Raw IoT data is not stored on-chain.
- The prototype assumes the device owner key is trusted.
- The prototype does not solve malicious sensor hardware or key theft.

## Recommended next reporting step

After you run the evaluation script and collect numbers, the next best step is to convert them into:

- one evaluation table,
- one short results discussion,
- one limitations paragraph,
- one future work paragraph.
