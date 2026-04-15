# Presentation Script

## 15-Minute Oral Presentation Script

This script is written to match the slide structure in [PRESENTATION_SLIDES.md](/Users/bijaypandey/Documents/Blockchain_assignments/blockchain_project/blockchain-iot-provenance/docs/PRESENTATION_SLIDES.md).

The tone is intended to sound natural and academic, not robotic. You do not need to memorize every sentence exactly. The best approach is to practice until you can say the ideas in your own words while keeping the structure.

---

## Slide 1. Title

Hello everyone. My name is [Your Name], and today I will present my project titled “Blockchain-Based IoT Authentication and Data Provenance Verification Using Smart Contracts.”

This project focuses on a practical blockchain application in the Internet of Things domain. More specifically, I looked at how blockchain can be used to solve two important problems in IoT systems: secure device authentication and trustworthy data provenance verification.

---

## Slide 2. Problem Statement

The problem I focused on is that many IoT systems still rely on centralized services to manage devices and validate data. That creates several concerns.

First, an unauthorized device may attempt to join the network.

Second, even if data is collected from a legitimate device, that data may be modified later, either accidentally or maliciously.

Third, in centralized environments, it can be difficult to prove to another party that the device state and the recorded data were handled correctly.

---

## Slide 3. Objectives

Based on that problem, I defined five main objectives for the project.

The first objective was to register IoT devices securely.

The second was to authenticate and deauthenticate devices through explicit smart-contract logic.

The third was to store only sensor-data hashes on-chain, instead of storing full raw sensor data directly on the blockchain.

The fourth was to verify the provenance of a reading later by recomputing the hash and comparing it with the blockchain record.

And the fifth was to detect tampered readings reliably.

So overall, the idea was not to build a full production IoT platform, but to build a prototype that demonstrates blockchain-based trust and provenance in a measurable way.

---

## Slide 4. Proposed Architecture

This slide shows the system architecture.

The design has both off-chain and on-chain components.

On the off-chain side, I have an IoT simulator that generates sensor readings, a Python blockchain client that communicates with the deployed smart contracts, and a provenance verifier that checks whether a provided reading matches the blockchain record.

On the on-chain side, there are two smart contracts.

The first one is `IoTDeviceRegistry`, which handles device registration, authentication, and deauthentication.

The second one is `IoTDataRegistry`, which stores the provenance records in the form of `bytes32` hashes.

The key design decision is that raw sensor readings remain off-chain, while the blockchain stores only device state and data integrity proofs.

This keeps the system more scalable while still preserving auditability and tamper evidence.

---

## Slide 5. Smart Contract Design

The two smart contracts have separate responsibilities.

The `IoTDeviceRegistry` contract stores the owner address and authentication status for each device ID. It supports three main operations: registration, authentication, and deauthentication.

The `IoTDataRegistry` contract stores hashed provenance records. Each record contains the data hash, a timestamp, and the submitting address.

Before allowing data storage, `IoTDataRegistry` checks the device state in `IoTDeviceRegistry`.

That means a data hash can only be stored if the device is registered, currently authenticated, and the caller is the owner.

I separated these responsibilities into two contracts because that makes the logic cleaner and easier to test.

---

## Slide 6. End-to-End Workflow

This slide shows the system workflow from start to finish.

First, the device owner registers a device ID.

Second, the owner authenticates the device.

Third, the IoT simulator generates a sensor reading off-chain.

Fourth, the reading is hashed using `keccak256`.

Fifth, the resulting hash is stored on the blockchain.

Later, when provenance needs to be checked, the verifier recomputes the hash from a provided reading and compares it with the stored blockchain record.

If the two hashes match, the data is treated as authentic.

If the hashes do not match, the data is classified as tampered.

This workflow is the main idea behind the project.

---

## Slide 7. Implementation

The implementation uses several technologies together.

The smart contracts were written in Solidity.

Hardhat was used for contract compilation, deployment, and automated testing.

TypeScript was used for the evaluation script that measures gas usage and latency.

Python was used for the IoT simulator and provenance verification logic.

Web3.py was used as the bridge between the Python environment and the blockchain contracts.

So the project combines smart-contract development, automated testing, off-chain simulation, and evaluation in one complete prototype.

---

## Slide 8. Testing and Validation

Before doing evaluation, I validated the contract logic through automated Hardhat tests.

The tests cover positive and negative cases, including correct registration, duplicate registration rejection, correct authentication, unauthorized authentication rejection, deauthentication logic, unauthorized data submission rejection, invalid data retrieval, and behavior after deauthentication.

In total, the smart contract test suite passed successfully.

This was important because I wanted to make sure that the core logic was correct before measuring gas and latency.

In other words, testing established correctness, and evaluation established evidence.

---

## Slide 9. Experimental Results

This slide presents the main evaluation results.

I measured both gas usage and latency on a local Hardhat blockchain network.

The average gas used for device registration was 81,409.

Authentication used 31,488 gas on average.

Storing a data hash used 123,649 gas, which was the highest among the measured operations.

Deauthentication used 31,462 gas on average.

For retrieval, I measured latency only, since it is a read operation and does not involve a transaction fee in the same way.

The most important observation here is that storing provenance records is the most expensive operation, which makes sense because it appends new blockchain storage.

Authentication and deauthentication are cheaper because they only update existing state.

---

## Slide 10. Provenance Verification Result

This was the most important correctness outcome in the evaluation.

Across all test iterations, the original reading was always verified as valid.

And the tampered reading was always verified as invalid.

That means the system successfully detected whether a provided reading matched the blockchain-backed provenance record.

This directly supports the main claim of the project, which is that blockchain can act as a tamper-evident provenance layer for IoT data when hashes are stored on-chain.

---

## Slide 11. Limitations and Future Work

Although the project worked well as a prototype, it still has important limitations.

First, the evaluation was performed on a local Hardhat network, not on a public Ethereum-compatible network.

Second, raw sensor data remains off-chain, so the blockchain verifies integrity and provenance, but it does not guarantee that the original sensing process itself was honest.

Third, the system assumes the owner’s private key is trusted and not compromised.

For future work, possible extensions include decentralized identity integration, IPFS or other off-chain distributed storage, privacy-preserving access control, public testnet evaluation, and a more complete user-facing application layer.

So the current work should be seen as a functional research prototype rather than a production-ready system.

---

## Slide 12. Demo

I will now briefly demonstrate the system.

In the demo, I will show:

first, the contracts can be deployed,

second, the simulator can generate device readings and store the hashes,

and third, the provenance verifier can distinguish an original reading from a tampered one.

While the demo is running, the main things to notice are the device setup, the generated sensor readings, the blockchain hash storage, and the final valid-versus-tampered verification result.

---

## Demo Commentary

If you are typing commands live, this is a good short narration:

Here I am deploying the contracts to the local blockchain.

Now I am running the simulator.

The simulator sets up the devices, checks their authentication state, generates readings, hashes those readings, and stores the hashes on-chain.

After that, the verifier takes the original reading and compares its computed hash with the stored blockchain hash.

That case should return valid.

Then I modify the reading slightly and run the verification again.

This time the hash should not match, so the system should classify the reading as tampered.

---

## Slide 13. Conclusion

To conclude, this project implemented a blockchain-based IoT authentication and data provenance framework using smart contracts.

The system supports secure device registration, authentication, deauthentication, provenance storage, and tamper detection through hash verification.

The experimental results showed that the framework worked correctly and that storing only hashes on-chain provides a practical tradeoff between verifiability and storage efficiency.

So the main takeaway is that blockchain can serve as a practical trust layer for IoT systems when it is used selectively for identity state and integrity proofs rather than for full raw data storage.

Thank you. I’m happy to take questions.

---

## Short Answer Bank for Questions

### Q1. Why did you store only hashes instead of raw data?

I stored only hashes because blockchain storage is expensive and not scalable for high-volume IoT data. Hashes are enough to verify integrity while keeping raw data off-chain.

### Q2. Why use two smart contracts instead of one?

I separated device lifecycle management from provenance storage to keep the logic modular, easier to test, and easier to reason about.

### Q3. What attacks does the system address?

It addresses unauthorized device registration attempts, unauthorized authentication, unauthorized data submission, and post-generation tampering of readings.

### Q4. What attacks does it not address?

It does not fully address private-key theft, malicious sensor hardware, or false readings created before hashing.

### Q5. Why is `storeDataHash` the most expensive operation?

Because it appends a new record to blockchain storage, which costs more gas than simply updating an existing authentication flag.

### Q6. Is this production-ready?

Not yet. It is a research prototype designed to demonstrate the framework, validate correctness, and measure gas and latency.

### Q7. Why use blockchain here at all?

Because blockchain provides immutable, auditable state transitions and tamper-evident provenance records, which are useful when multiple parties need to trust the result without relying fully on one central authority.

---

## Delivery Tips

- Speak a little slower than normal conversation.
- Pause briefly after each main slide idea.
- Do not read every bullet exactly as written.
- Keep the demo short and reliable.
- If time becomes tight, shorten the demo, not the results slide.
