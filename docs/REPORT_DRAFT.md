# Report Draft

## Title

Blockchain-Based IoT Device Authentication and Data Provenance Verification Using Smart Contracts

## Author Information

- Your Name
- Student ID
- Course Code and Title
- Institution
- Email

## Abstract

Internet of Things (IoT) systems often rely on centralized infrastructure for device management and data validation, which creates challenges for trust, auditability, and tamper detection. This paper presents a blockchain-based framework for IoT device authentication and data provenance verification using smart contracts. The proposed system separates device identity management from data provenance storage through two Ethereum-compatible smart contracts: `IoTDeviceRegistry`, which manages device registration and authentication state, and `IoTDataRegistry`, which stores provenance records in the form of `bytes32` hashes. A Python-based IoT simulator is used to emulate sensor devices, generate readings, submit hashed data to the blockchain, and verify whether a provided reading matches the corresponding on-chain record. Experimental evaluation on a local Hardhat blockchain network shows that the framework correctly distinguishes authentic readings from tampered ones in all test iterations. The measured average gas usage was 81,409 for device registration, 31,488 for authentication, 123,649 for data-hash storage, and 31,462 for deauthentication. The results indicate that storing only integrity proofs on-chain is a practical approach for IoT provenance while maintaining verifiability and reducing storage cost. The prototype is limited by local-network evaluation and by assumptions of trusted device ownership and honest sensor acquisition.

## Index Terms

Blockchain, Internet of Things, IoT authentication, data provenance, smart contracts, integrity verification, Ethereum, decentralized security.

## 1. Introduction

The Internet of Things has enabled large numbers of connected devices to sense, transmit, and react to data in domains such as healthcare, industrial monitoring, agriculture, transportation, and smart homes. As IoT deployments scale, security and trust management become increasingly difficult. Two problems are particularly important in many IoT environments: verifying that a device is authorized to participate in the system, and verifying that the data attributed to a device has not been modified after it was produced. NIST guidance on IoT cybersecurity emphasizes the importance of device identification, secure configuration, logical access control, and protection of device data, all of which reinforce the need for trustworthy device-state management in IoT systems [1].

Traditional IoT deployments commonly depend on centralized architectures for device onboarding, authentication, and data management. While such architectures are convenient, they create single points of trust and can limit transparency, auditability, and tamper resistance. If an attacker compromises the central authority, or if stakeholders do not fully trust the central service, it becomes more difficult to prove whether a device was legitimately authenticated or whether stored data was altered. Prior surveys have also noted that conventional IoT environments face persistent challenges related to trust, data integrity, and the secure coordination of large numbers of heterogeneous devices [2], [7].

Blockchain technology offers a useful set of properties for addressing these concerns, including immutability, auditability, and transparent state transitions. Smart contracts can encode access-control rules and provenance policies in a verifiable form. Early work on blockchain and smart contracts for IoT highlighted the potential of this combination to support trustless coordination and automated policy enforcement among connected devices [3]. However, directly storing full IoT data streams on-chain is expensive and inefficient due to blockchain storage cost and scalability limits. For this reason, many practical designs store only integrity proofs or metadata on-chain, while retaining raw data off-chain [4], [5].

This project follows that design philosophy. It proposes a blockchain-based IoT authentication and provenance verification framework in which device lifecycle state is managed on-chain and sensor readings are represented on-chain only by cryptographic hashes. The framework includes Solidity smart contracts, a Hardhat-based testing and deployment environment, and a Python-based IoT simulator for demonstrating device setup, data submission, and provenance verification.

The main contributions of this work are as follows:

1. A smart-contract-based device registry for IoT registration, authentication, and deauthentication.
2. A provenance contract that stores only hashed sensor records while enforcing ownership and authentication constraints.
3. An end-to-end IoT simulation workflow that demonstrates valid and tampered data verification.
4. An experimental evaluation of correctness, gas usage, and latency on a local Ethereum-compatible blockchain environment.

The remainder of this paper is organized as follows. Section 2 reviews relevant work in blockchain-enabled IoT security and provenance. Section 3 defines the system and threat model. Section 4 describes the proposed methodology and framework design. Section 5 summarizes the implementation. Section 6 presents the experimental setup, while Section 7 reports and discusses the results. Section 8 outlines limitations, and Section 9 concludes the paper with directions for future work.

## 2. Related Work

Blockchain has been widely explored as a mechanism for improving trust and security in IoT environments. Prior research has investigated blockchain-based approaches for decentralized identity, access control, secure logging, and provenance tracking. These efforts are motivated by the observation that IoT systems often involve multiple parties, heterogeneous devices, and weak trust assumptions, making centralized security models difficult to scale [2], [7].

One major stream of work focuses on blockchain for IoT identity and trust management. In such systems, blockchain is used to record device registration events, ownership bindings, authentication state, or trust scores. The main benefit of this approach is that state transitions become transparent and tamper-evident, reducing reliance on a single administrative authority. Smart contracts are especially useful in this context because they allow device authorization rules to be encoded directly into blockchain logic [3]. More recent work has continued this direction by emphasizing decentralized authentication, identity management, and integrity protection as core motivations for blockchain-enabled IoT security architectures [9].

Another important stream of research studies blockchain-based provenance and integrity verification. In these systems, rather than storing full IoT data directly on-chain, the system records a cryptographic digest of the data. Later, the digest can be recomputed from a provided dataset and compared against the on-chain record. This model is appealing because it preserves the integrity and auditability benefits of blockchain while avoiding the high cost of storing high-volume IoT data directly on-chain. Survey work on IoT provenance has emphasized that provenance mechanisms are useful for tracing the origin and evolution of IoT data, especially in environments where data may be modified or processed by multiple entities [4]. More specialized blockchain-based frameworks for IoT have also shown that smart contracts can be used to enforce security policies, maintain auditable logs, and support practical prototype deployments for connected-device environments [5], [6].

Existing work also highlights the tradeoff between on-chain transparency and storage scalability. Full on-chain data storage provides strong immutability but is usually impractical for real IoT workloads. Hybrid designs, where raw data is kept off-chain and only hashes or references are stored on-chain, are therefore commonly proposed as a more scalable alternative [2], [5], [7]. This project adopts the hybrid approach by keeping only `bytes32` integrity proofs on-chain.

Relative to prior work, this project does not attempt to solve all aspects of IoT security, such as privacy-preserving identity, decentralized key recovery, or trusted sensing hardware. Instead, it focuses on a narrower but practical objective: integrating device registration and authentication with a provenance-verification workflow, then measuring the cost and behavior of that design through a working prototype. This gives the project a concrete systems focus rather than a purely conceptual one.

## 3. System Model and Threat Model

The system consists of five main entities: an IoT device, a device owner, two smart contracts, a blockchain network, and a provenance verifier. In the prototype, IoT devices are represented by simulated sensor instances rather than physical hardware. Each device is associated with a device identifier and is controlled by an owner account that submits blockchain transactions. The blockchain network executes the smart contracts and persists the resulting state. A verifier later checks whether a submitted reading matches the corresponding on-chain provenance record.

The first contract, `IoTDeviceRegistry`, maintains the ownership and authentication status of each device identifier. The second contract, `IoTDataRegistry`, stores data provenance entries in the form of `bytes32` hashes together with metadata such as submission timestamp and sender address. The design separates identity state from provenance state, which improves modularity and keeps contract responsibilities clear.

The threat model assumes that the blockchain itself provides tamper-evident storage and correct contract execution. It also assumes that the owner account used for transactions is valid and that the raw sensor reading exists off-chain before hashing. Under these assumptions, the system aims to defend against four main threats:

- duplicate or unauthorized device registration,
- unauthorized attempts to authenticate or deauthenticate devices,
- unauthorized submission of sensor-data hashes,
- post-generation tampering of sensor readings before verification.

The system does not protect against all possible IoT attacks. In particular, it does not solve private-key theft, malicious sensor hardware, fabricated readings generated before hashing, privacy leakage from metadata, or large-scale public-chain deployment concerns. These limitations are important because the system is designed primarily as a prototype for authentication and provenance verification, not as a complete production IoT security stack.

## 4. Methodology and Framework Design

### 4.1 Overall Framework

The proposed framework combines on-chain device-state enforcement with off-chain sensor simulation and verification. The overall workflow is as follows:

1. A device owner registers a device identifier in the device registry contract.
2. The same owner authenticates the device before it is allowed to submit provenance records.
3. A sensor reading is generated off-chain by the IoT simulator.
4. The reading is hashed using `keccak256`.
5. The resulting hash is stored on-chain in the provenance contract.
6. Later, a verifier recomputes the hash from a provided reading.
7. The recomputed hash is compared with the stored on-chain hash.
8. If the values match, the reading is considered authentic; otherwise, it is treated as tampered.

This workflow intentionally stores only integrity proofs on-chain. The blockchain acts as a trust anchor for device state and provenance records, while the simulator and verification logic handle operational data off-chain.

### 4.2 Smart Contract Design

#### A. IoTDeviceRegistry

`IoTDeviceRegistry` is responsible for device lifecycle management. For each device identifier, it stores:

- the owner address, and
- the current authentication status.

The contract supports three state-changing operations:

- `registerIoTDevice`, which registers a new device identifier and binds it to the caller,
- `authenticateIoTDevice`, which marks a registered device as authenticated,
- `deauthenticateIoTDevice`, which revokes authentication while preserving device ownership.

The contract rejects empty identifiers, duplicate registrations, non-owner authentication attempts, and invalid deauthentication requests. This ensures that only legitimate owners can transition device state.

#### B. IoTDataRegistry

`IoTDataRegistry` stores provenance entries for devices. Each record contains:

- a `bytes32` hash of the sensor reading,
- a timestamp,
- the submitting address.

Before accepting a provenance record, the contract queries `IoTDeviceRegistry` to confirm that:

- the device is registered,
- the device is currently authenticated,
- the caller is the device owner.

This creates an explicit link between device state and provenance submission rights. Historical provenance records remain readable even after deauthentication, which is important because provenance systems are useful only if past records remain auditable.

### 4.3 Off-Chain Simulation and Verification

The off-chain part of the framework is implemented in Python. The simulator creates multiple logical devices, each associated with a sensor type such as temperature, humidity, or pressure. During execution, the simulator generates numeric readings, hashes them using `keccak256`, and submits the resulting hashes through a blockchain client built with Web3.py.

For verification, a provided reading is hashed again using the same deterministic method. The verifier retrieves the corresponding blockchain record and compares the stored hash with the recomputed value. Matching hashes indicate that the reading is authentic relative to the on-chain provenance record, whereas mismatched hashes indicate tampering.

### 4.4 Design Rationale

Three design choices are central to this framework.

First, device identity and provenance logic are separated into two smart contracts. This improves clarity and makes the authentication policy reusable for provenance enforcement.

Second, only cryptographic hashes are stored on-chain. This reduces blockchain storage cost and keeps the design more scalable than raw-data storage, while still enabling integrity verification.

Third, historical data-hash retrieval remains available after deauthentication. This preserves the auditability property of provenance systems: deauthentication should revoke future write privilege, not erase the ability to verify previously recorded evidence.

## 5. Implementation

The prototype is implemented using Solidity, Hardhat, TypeScript, and Python. The smart contracts are written in Solidity and compiled using Hardhat. Contract deployment and local evaluation scripts are written in TypeScript. The IoT simulator and provenance verifier are written in Python using Web3.py and python-dotenv. The design choice of combining smart contracts for state enforcement with off-chain client logic is consistent with the broader smart-contract systems literature, which identifies automation, transparency, and decentralized rule execution as key strengths of blockchain-based applications [3], [8].

The implementation includes two contract files:

- `contracts/IoTDeviceRegistry.sol`
- `contracts/IoTDataRegistry.sol`

Contract correctness is validated through Hardhat test suites:

- `test/IoTDeviceRegistryTest.ts`
- `test/IoTDataRegistryTest.ts`

These tests cover positive and negative cases for device registration, authentication, deauthentication, access control, provenance storage, retrieval, invalid index handling, and post-deauthentication write restrictions.

The off-chain system is implemented through:

- `iot-simulator/blockchain_client.py` for contract interaction,
- `iot-simulator/iot_data_generator.py` for synthetic sensor values,
- `iot-simulator/iot_simulator.py` for multi-device simulation,
- `iot-simulator/provenance_verification.py` for hash-based integrity checking,
- `iot-simulator/main.py` for the end-to-end demonstration.

An additional evaluation script, `scripts/evaluate.ts`, automates measurement of gas usage and local latency across repeated iterations.

## 6. Experimental Setup

The framework was evaluated on a local Hardhat blockchain network to measure functional correctness, gas usage, and latency under controlled conditions. A local environment was selected to provide deterministic deployment, repeatable execution, and straightforward access to transaction receipts and timing information.

For each evaluation run, fresh instances of `IoTDeviceRegistry` and `IoTDataRegistry` were deployed. A sequence of operations was then performed for each iteration:

1. register a new evaluation device,
2. authenticate the device,
3. store a hashed provenance record,
4. retrieve the stored hash,
5. deauthenticate the device,
6. compare the stored hash with the original and tampered readings.

The evaluation script was executed for multiple iterations and recorded:

- average gas used for state-changing blockchain operations,
- average latency for write and read operations,
- correctness of provenance verification for original and tampered inputs.

The measured operations were:

- `registerIoTDevice`,
- `authenticateIoTDevice`,
- `storeDataHash`,
- `getDeviceDataHash`,
- `deauthenticateIoTDevice`.

Correctness was considered successful if the original reading was classified as valid and the tampered reading was classified as invalid in each iteration.

## 7. Results and Discussion

The evaluation produced consistent correctness and cost results across all iterations. In every run, the original reading was verified as valid, while the tampered reading was correctly rejected as invalid. This outcome supports the central claim of the project: the framework can detect whether a provided reading matches the blockchain-backed provenance record.

The measured averages are shown in Table 1.

| Operation | Average Gas Used | Average Latency (ms) |
|---|---:|---:|
| `registerIoTDevice` | 81,409 | 61.33 |
| `authenticateIoTDevice` | 31,488 | 65.00 |
| `storeDataHash` | 123,649 | 53.67 |
| `getDeviceDataHash` | N/A | 11.67 |
| `deauthenticateIoTDevice` | 31,462 | 43.67 |

The gas profile is consistent with the design of the contracts. `storeDataHash` is the most expensive operation because it appends a new provenance record to blockchain storage. `registerIoTDevice` is the next most expensive operation because it creates a new device entry and updates supporting structures. In contrast, `authenticateIoTDevice` and `deauthenticateIoTDevice` are significantly cheaper because they update existing state rather than creating new provenance entries.

The latency values also reflect the difference between state-changing and read-only operations. The read-only `getDeviceDataHash` call is much faster because it does not require transaction mining. The write operations take longer because they involve transaction submission, blockchain execution, and receipt generation. Since the measurements were collected on a localhost Hardhat network, the latency values should be interpreted as local prototype timings rather than real-world public-chain performance.

From a design perspective, the results reinforce the practicality of storing only hashed provenance records on-chain. If full sensor data were stored directly on-chain, storage cost would increase substantially. By limiting on-chain storage to integrity proofs, the framework preserves verifiability while reducing blockchain cost. This makes the architecture better suited to IoT scenarios where data may be generated frequently and at scale.

Overall, the results demonstrate that the proposed framework is functionally correct and economically coherent for a prototype environment. The authentication and deauthentication operations are lightweight enough for repeated use, while provenance storage remains feasible when only hashes are stored on-chain.

## 8. Limitations

Despite the positive results, the prototype has several limitations. First, the evaluation was conducted only on a local Hardhat blockchain network. While this is appropriate for controlled experimentation, it does not capture the latency, congestion, or pricing behavior of a public Ethereum-compatible network.

Second, the system stores only data hashes on-chain and does not protect the raw off-chain sensor data itself. If a malicious actor forges sensor readings before hashing, the blockchain can preserve those hashes faithfully but cannot determine whether the original sensing process was honest.

Third, the framework assumes that the device owner’s private key remains secure. If the owner key is compromised, an attacker could potentially submit fraudulent but validly signed provenance entries.

Fourth, the prototype does not implement privacy-preserving identity, decentralized identifier management, off-chain distributed storage integration, or large-scale benchmarking. These concerns are important in real deployments but fall outside the scope of the current project.

## 9. Conclusion

This paper presented a blockchain-based IoT authentication and data provenance verification framework built with smart contracts, a local blockchain environment, and a Python-based device simulator. The proposed design separates device identity management from provenance storage, allowing authentication state and provenance records to be enforced through explicit contract logic. By storing only cryptographic hashes on-chain, the framework supports tamper-evident verification without incurring the cost of full raw-data storage on the blockchain.

The implementation successfully demonstrated device registration, authentication, deauthentication, provenance submission, and post hoc data verification. Experimental results showed that authentic readings were verified correctly and tampered readings were rejected consistently. Gas and latency measurements further indicated that provenance storage is the most expensive blockchain operation, while authentication-state changes are comparatively lightweight.

These findings suggest that blockchain can serve as a practical trust layer for IoT provenance when combined with off-chain data generation and on-chain integrity proofs. Although the current system is a prototype, it provides a useful foundation for further exploration of decentralized IoT trust management and provenance-aware data security.

## 10. Future Work

Several directions can extend this work. One improvement would be to integrate decentralized identity or certificate-based device management to reduce dependence on a single owner key. Another would be to combine the current design with off-chain storage platforms such as IPFS for scalable management of raw sensor data and metadata.

Further evaluation on public or consortium Ethereum-compatible test networks would provide more realistic performance and economic data. Additional future work could also explore privacy-preserving access control, richer provenance metadata, batch submissions for improved efficiency, and a more complete backend or user-facing dashboard for operational deployment.

## 11. References

[1] M. Fagan, K. N. Megas, K. Scarfone, and M. Smith, “IoT Device Cybersecurity Capability Core Baseline,” National Institute of Standards and Technology, Gaithersburg, MD, USA, NIST IR 8259A, May 2020. doi: 10.6028/NIST.IR.8259A.

[2] X. Wang, X. Zha, W. Ni, R. P. Liu, Y. J. Guo, X. Niu, and K. Zheng, “Survey on blockchain for Internet of Things,” Computer Communications, vol. 136, pp. 10–29, Feb. 2019. doi: 10.1016/j.comcom.2019.01.006.

[3] K. Christidis and M. Devetsikiotis, “Blockchains and smart contracts for the Internet of Things,” *IEEE Access*, vol. 4, pp. 2292–2303, 2016. doi: 10.1109/ACCESS.2016.2566339.

[4] R. Hu, Z. Yan, W. Ding, and L. T. Yang, “A survey on data provenance in IoT,” *World Wide Web*, vol. 23, pp. 1441–1463, 2020. doi: 10.1007/s11280-019-00746-1.

[5] M. Sigwart, M. Borkowski, M. Peise, S. Schulte, and S. Tai, “A secure and extensible blockchain-based data provenance framework for the Internet of Things,” *Personal and Ubiquitous Computing*, vol. 28, pp. 309–323, 2024. doi: 10.1007/s00779-020-01417-z.

[6] J. Pan, J. Wang, A. Hester, I. Alqerm, Y. Liu, and Y. Zhao, “EdgeChain: An Edge-IoT framework and prototype based on blockchain and smart contracts,” *IEEE Internet of Things Journal*, vol. 6, no. 3, pp. 4719–4732, Jun. 2019. doi: 10.1109/JIOT.2018.2878154.

[7] Y. Kareem, D. Djenouri, and E. Ghadafi, “A survey on emerging blockchain technology platforms for securing the Internet of Things,” *Future Internet*, vol. 16, no. 8, Art. no. 285, 2024. doi: 10.3390/fi16080285.

[8] T. M. Hewa, Y. Hu, M. Liyanage, S. S. Kanhere, and M. Ylianttila, “Survey on blockchain based smart contracts: Applications, opportunities and challenges,” *Journal of Network and Computer Applications*, vol. 177, Art. no. 102857, 2021. doi: 10.1016/j.jnca.2020.102857.

[9] R. Chohan, K. Mal, M. J. Afridi, T. Shabbir, and S. Yamin, “Blockchain-based authentication for secure IoT networks: A decentralized approach to identity management and data integrity,” *Kashf Journal of Multidisciplinary Research*, vol. 2, no. 7, pp. 225–247, Jul. 2025. doi: 10.71146/kjmr556.
