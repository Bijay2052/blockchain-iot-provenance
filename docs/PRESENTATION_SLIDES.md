# Presentation Slides

## 15-Minute Presentation Plan

This slide plan is designed for a 15-minute project presentation with a short live demo.

Recommended timing:

- Slides 1-8: about 10-11 minutes
- Demo: about 3-4 minutes
- Buffer/Q&A: about 1 minute

---

## Slide 1. Title

### Title

Blockchain-Based IoT Authentication and Data Provenance Verification Using Smart Contracts

### Subtitle

Course Project Presentation

### Include

- Your name
- Student ID
- Course name
- Institution

### What to say

This project focuses on using blockchain to solve two important IoT security problems: verifying that a device is legitimately authorized, and verifying that the data claimed to come from that device has not been tampered with.

---

## Slide 2. Problem Statement

### Title

Problem Being Addressed

### Slide bullets

- IoT systems often rely on centralized device management
- Centralized systems create trust and auditability issues
- Unauthorized devices may try to join the network
- Sensor data may be modified after generation
- Need a tamper-evident and auditable framework

### What to say

The core problem is that traditional IoT systems usually trust a central server to manage devices and validate data. That makes it harder to prove whether a device was genuinely authenticated or whether data was changed later. My project uses blockchain as a transparent and tamper-evident trust layer.

---

## Slide 3. Objectives

### Title

Project Objectives

### Slide bullets

- Register IoT devices securely
- Authenticate and deauthenticate devices
- Store sensor-data hashes on-chain
- Verify provenance of a reading later
- Detect tampered readings

### What to say

The goal was not to store all IoT data on-chain. Instead, I designed a system that keeps only device state and hashed integrity proofs on-chain, while the raw readings stay off-chain.

---

## Slide 4. Proposed Architecture

### Title

System Architecture

### Slide bullets

- `IoTDeviceRegistry` smart contract
- `IoTDataRegistry` smart contract
- Python blockchain client
- IoT simulator
- Provenance verifier

### Suggested diagram

Draw a simple flow:

IoT Simulator -> Blockchain Client -> IoTDeviceRegistry / IoTDataRegistry -> Provenance Verifier

### What to say

The architecture has two on-chain contracts and an off-chain simulator workflow. One contract manages device identity and authentication status. The second contract stores provenance records as hashes. The simulator generates readings and submits hashes, and the verifier later compares a recomputed hash with the stored blockchain record.

---

## Slide 5. Smart Contract Design

### Title

Smart Contract Design

### Slide bullets

- `IoTDeviceRegistry`
- registers devices
- authenticates devices
- deauthenticates devices
- stores owner and authentication state

- `IoTDataRegistry`
- stores `bytes32` data hashes
- stores timestamp and submitter
- allows writes only for authenticated device owners

### What to say

The contracts were intentionally separated to keep the design modular. Device state management is handled independently from provenance storage. This also makes the authorization rules easier to understand and test.

---

## Slide 6. Workflow

### Title

End-to-End Workflow

### Slide bullets

1. Register device
2. Authenticate device
3. Generate sensor reading
4. Hash reading with `keccak256`
5. Store hash on blockchain
6. Recompute hash later
7. Compare with stored blockchain record

### What to say

This is the core system flow. If the recomputed hash matches the stored hash, the reading is treated as authentic. If the values differ, the system flags the reading as tampered.

---

## Slide 7. Implementation

### Title

Implementation Stack

### Slide bullets

- Solidity smart contracts
- Hardhat for testing and deployment
- TypeScript evaluation scripts
- Python IoT simulator
- Web3.py for blockchain interaction

### Mention key files

- `contracts/IoTDeviceRegistry.sol`
- `contracts/IoTDataRegistry.sol`
- `test/IoTDeviceRegistryTest.ts`
- `test/IoTDataRegistryTest.ts`
- `iot-simulator/main.py`
- `scripts/evaluate.ts`

### What to say

I used Solidity for the smart contracts, Hardhat for unit testing and deployment, and Python for the actual IoT simulation and provenance verification workflow. TypeScript was used for automated evaluation of gas and latency.

---

## Slide 8. Testing and Validation

### Title

Testing and Validation

### Slide bullets

- 19 smart contract tests passed
- device registration cases tested
- authentication and deauthentication cases tested
- unauthorized access cases tested
- data storage and retrieval cases tested
- post-deauthentication write restriction tested

### What to say

Before moving to evaluation, I validated the contract logic through automated Hardhat tests. These covered positive and negative paths, including duplicate registration, unauthorized authentication, unauthorized data writes, and invalid retrieval attempts.

---

## Slide 9. Experimental Results

### Title

Evaluation Results

### Table

| Operation | Average Gas Used | Average Latency |
|---|---:|---:|
| Register Device | 81,409 | 61.33 ms |
| Authenticate Device | 31,488 | 65.00 ms |
| Store Data Hash | 123,649 | 53.67 ms |
| Get Data Hash | N/A | 11.67 ms |
| Deauthenticate Device | 31,462 | 43.67 ms |

### What to say

The most expensive operation was storing a provenance record because it appends new on-chain storage. Authentication and deauthentication were much cheaper because they only update device state. Read operations were faster because they do not require transaction mining.

---

## Slide 10. Provenance Verification Result

### Title

Correctness of Provenance Verification

### Slide bullets

- Original reading verified as valid in all iterations
- Tampered reading verified as invalid in all iterations
- Demonstrates successful integrity verification
- Confirms blockchain-backed provenance checking works

### What to say

This was the most important functional result. In every evaluation iteration, the original reading matched the blockchain record, while the modified reading failed verification. That directly supports the main project claim.

---

## Slide 11. Limitations and Future Work

### Title

Limitations and Future Work

### Limitations

- evaluated only on local Hardhat network
- raw IoT data stored off-chain
- assumes secure private keys
- does not address malicious sensor hardware

### Future work

- decentralized identity integration
- IPFS or off-chain distributed storage
- privacy-preserving access control
- public testnet evaluation
- user-facing dashboard/backend completion

### What to say

The project is a prototype, not a full production system. It shows that the approach is feasible, but there are still important open areas such as privacy, decentralized identity, and large-scale public-chain performance.

---

## Slide 12. Demo

### Title

Live Demo

### Demo steps

1. Show tests passing with `npm test`
2. Show deployment with `npm run deploy:localhost`
3. Show simulator run with `npm run simulator`
4. Point out:
   - devices being set up
   - readings generated
   - hashes stored
   - provenance verification
   - original valid / tampered invalid

### What to say

I will now run the system end to end to show that the contracts, simulator, and provenance verification all work together in practice.

---

## Slide 13. Conclusion

### Title

Conclusion

### Slide bullets

- Developed a blockchain-based IoT authentication and provenance system
- Enforced device lifecycle through smart contracts
- Verified sensor-data integrity using on-chain hashes
- Demonstrated correct tamper detection
- Evaluated cost and latency in a local blockchain environment

### Closing line

The project shows that blockchain can be used as a practical trust layer for IoT authentication and data provenance when only integrity proofs are stored on-chain.

---

## Backup Slide A. Why Only Hashes On-Chain?

### Slide bullets

- lower blockchain storage cost
- better scalability
- preserves verifiability
- raw data can remain off-chain

---

## Backup Slide B. Threat Model

### Slide bullets

- addressed:
  - unauthorized registration
  - unauthorized authentication
  - unauthorized data submission
  - post-generation tampering
- not addressed:
  - stolen keys
  - malicious hardware
  - forged readings before hashing

---

## Backup Slide C. Demo Commands

```bash
npm test
npm run deploy:localhost
npm run simulator
npm run evaluate:local
```

---

## Delivery Tips

- Spend the most time on Slides 2, 4, 6, 9, and 10
- Do not read the slide text word for word
- Keep the demo short and deterministic
- If time is short, reduce the demo and keep the results slide
- If asked a difficult question, connect the answer back to:
  - device authentication,
  - provenance,
  - on-chain hashes vs off-chain raw data,
  - evaluation results
