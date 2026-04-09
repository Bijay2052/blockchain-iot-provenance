# Blockchain-Based IoT Authentication and Data Provenance System

This project implements a blockchain-based framework for:

- registering IoT devices,
- authenticating and deauthenticating devices,
- storing integrity proofs of IoT sensor readings on-chain, and
- verifying whether a provided reading matches the blockchain record.

The project is organized as a research-style prototype rather than a production deployment. The core contribution is the smart-contract and simulator workflow that demonstrates device identity control and data provenance verification.

## Problem Statement

Traditional IoT deployments often rely on centralized services for device onboarding and data integrity checks. That creates a few common problems:

- unauthorized or duplicate device registration,
- weak auditability of device authentication state,
- difficulty proving whether sensor data was modified after generation,
- limited trust when multiple stakeholders need to verify data provenance.

This project addresses those problems by using blockchain as a tamper-evident trust layer:

- `IoTDeviceRegistry` manages device identity and authentication state.
- `IoTDataRegistry` stores only hashed sensor readings, not raw sensor payloads.
- the Python simulator generates readings, hashes them, submits them on-chain, and verifies provenance later.

## Research Goal

The goal is to demonstrate that blockchain can be used as a lightweight provenance layer for IoT systems by combining:

1. on-chain device identity and authorization,
2. on-chain storage of sensor-data hashes,
3. off-chain generation of raw sensor data,
4. deterministic provenance verification by recomputing hashes.

## Architecture

### On-chain layer

- [contracts/IoTDeviceRegistry.sol](/Users/bijaypandey/Documents/Blockchain_assignments/blockchain_project/blockchain-iot-provenance/contracts/IoTDeviceRegistry.sol)
  - registers devices
  - authenticates devices
  - deauthenticates devices
  - records ownership and authentication state

- [contracts/IoTDataRegistry.sol](/Users/bijaypandey/Documents/Blockchain_assignments/blockchain_project/blockchain-iot-provenance/contracts/IoTDataRegistry.sol)
  - accepts `bytes32` hashes only
  - allows writes only from registered and authenticated device owners
  - stores timestamped provenance records

### Off-chain layer

- [iot-simulator/blockchain_client.py](/Users/bijaypandey/Documents/Blockchain_assignments/blockchain_project/blockchain-iot-provenance/iot-simulator/blockchain_client.py)
  - connects Python to deployed contracts
  - signs and submits blockchain transactions
  - hashes sensor data
  - verifies stored provenance

- [iot-simulator/iot_data_generator.py](/Users/bijaypandey/Documents/Blockchain_assignments/blockchain_project/blockchain-iot-provenance/iot-simulator/iot_data_generator.py)
  - generates mock sensor readings

- [iot-simulator/iot_simulator.py](/Users/bijaypandey/Documents/Blockchain_assignments/blockchain_project/blockchain-iot-provenance/iot-simulator/iot_simulator.py)
  - provisions devices
  - submits data hashes
  - tracks blockchain record indexes

- [iot-simulator/provenance_verification.py](/Users/bijaypandey/Documents/Blockchain_assignments/blockchain_project/blockchain-iot-provenance/iot-simulator/provenance_verification.py)
  - checks whether a reading matches the stored blockchain hash

- [iot-simulator/main.py](/Users/bijaypandey/Documents/Blockchain_assignments/blockchain_project/blockchain-iot-provenance/iot-simulator/main.py)
  - runs the end-to-end demonstration

### Optional application layer

- [backend](/Users/bijaypandey/Documents/Blockchain_assignments/blockchain_project/blockchain-iot-provenance/backend)
- [frontend](/Users/bijaypandey/Documents/Blockchain_assignments/blockchain_project/blockchain-iot-provenance/frontend)

These folders currently exist as extensions of the prototype and are not yet the strongest or most complete part of the project.

## Device and Data Lifecycle

1. A device owner registers a device ID in `IoTDeviceRegistry`.
2. The device owner authenticates the device.
3. The simulator generates a sensor reading off-chain.
4. The reading is hashed using `keccak256`.
5. The hash is stored in `IoTDataRegistry`.
6. Later, a verifier recomputes the hash from a provided reading.
7. The recomputed hash is compared with the stored blockchain record.
8. If the hashes match, the data is considered authentic. Otherwise, it is flagged as tampered.

## Project Structure

```text
blockchain-iot-provenance/
├── contracts/
├── scripts/
├── test/
├── iot-simulator/
├── backend/
├── frontend/
├── hardhat.config.ts
├── package.json
└── .env.example
```

## Prerequisites

### Node.js

This project uses Hardhat 3 and should be run with Node `>=20.6.0`.

Recommended version:

```bash
nvm use
```

The repo includes [.nvmrc](/Users/bijaypandey/Documents/Blockchain_assignments/blockchain_project/blockchain-iot-provenance/.nvmrc) pinned to:

```text
22.10.0
```

### Python

Python 3.10+ is recommended for the IoT simulator.

## Setup

### 1. Install Node dependencies

```bash
npm install
```

### 2. Install Python simulator dependencies

```bash
cd iot-simulator
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..
```

### 3. Configure environment variables

Copy [.env.example](/Users/bijaypandey/Documents/Blockchain_assignments/blockchain_project/blockchain-iot-provenance/.env.example) to `.env` and fill in:

- `RPC_URL`
- `DEVICE_REGISTRY_CONTRACT_ADDRESS`
- `DATA_REGISTRY_CONTRACT_ADDRESS`
- `ACCOUNT_ADDRESS`
- `PRIVATE_KEY`

## Development Workflow

### 1. Start a local Hardhat node

```bash
npm run node
```

### 2. Deploy contracts to localhost

In a second terminal:

```bash
npm run deploy:localhost
```

Copy the printed contract addresses into `.env`.

### 3. Run the contract test suite

```bash
npm test
```

### 4. Run the IoT simulator demo

```bash
cd iot-simulator
source venv/bin/activate
python main.py
```

Or from project root:

```bash
npm run simulator
```

## What the Demo Shows

The demo in [iot-simulator/main.py](/Users/bijaypandey/Documents/Blockchain_assignments/blockchain_project/blockchain-iot-provenance/iot-simulator/main.py) performs:

1. device setup,
2. device authentication checks,
3. sensor reading generation,
4. hash submission to the blockchain,
5. provenance verification for the original reading,
6. provenance verification for a tampered reading.

Expected outcome:

- original reading should verify as valid,
- tampered reading should fail verification.

## Smart Contract Test Coverage

### Device registry

- successful registration
- duplicate registration rejection
- successful authentication
- non-owner authentication rejection
- unregistered device authentication rejection
- duplicate authentication rejection
- successful deauthentication
- non-owner deauthentication rejection
- invalid deauthentication rejection

### Data registry

- successful hash storage for authenticated devices
- rejection for unauthenticated devices
- rejection for unregistered devices
- multiple hash storage and retrieval
- access control on hash submission

## Threat Model

This prototype is designed to address:

- duplicate or unauthorized device registration,
- unauthorized data submission,
- tampering with sensor readings after they are generated,
- lack of transparent auditability for device authentication state.

This prototype does not fully address:

- stolen private keys,
- compromised IoT hardware,
- forged sensor acquisition before hashing,
- privacy-preserving data sharing,
- large-scale performance on public blockchains,
- decentralized key management.

## Why Raw Data Is Not Stored On-Chain

Only hashes are stored on-chain because:

- blockchain storage is expensive,
- raw IoT data can be large and frequent,
- hashes are sufficient for integrity and provenance verification,
- off-chain storage is more scalable for realistic IoT deployments.

This follows a common research pattern: keep verification anchors on-chain and keep operational data off-chain.

## Current State of the Project

### Implemented

- smart contracts for device identity and provenance
- Hardhat deployment script
- contract tests
- Python-based IoT simulation
- provenance verification workflow

### Partially implemented

- backend API
- frontend user interface
- project-wide reproducibility documentation

### Not yet complete

- gas and latency evaluation
- scalability experiments
- final research diagrams and write-up
- polished UI/dashboard
- production-grade API integration

## Recommended Next Research Steps

1. Ensure the project runs cleanly on a supported Node version.
2. Run and document all contract tests.
3. Measure gas costs for all blockchain operations.
4. Measure transaction latency and verification latency.
5. Add integration tests for the full end-to-end workflow.
6. Decide whether backend and frontend are in-scope or future work.
7. Write the architecture diagram, sequence diagram, and threat model section.
8. Write the evaluation and limitations section for the report.

## Useful Commands

```bash
npm run compile
npm test
npm run node
npm run deploy:localhost
npm run clean
npm run simulator
```

## Notes

- If the local Hardhat node is restarted, contract addresses will change and `.env` must be updated after redeployment.
- If tests fail immediately with a Hardhat runtime error, check your Node version first.
- The backend and frontend should currently be treated as secondary to the contract-and-simulator research workflow.
