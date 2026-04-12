import hre from "hardhat";
import { ethers, type ContractTransactionResponse } from "ethers";
import dotenv from "dotenv";

dotenv.config();

type Metric = {
    operation: string;
    gasUsed?: bigint;
    latencyMs: number;
    notes?: string;
};

function average(values: number[]) {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function averageBigInt(values: bigint[]) {
    if (values.length === 0) return 0n;
    return values.reduce((sum, value) => sum + value, 0n) / BigInt(values.length);
}

async function measureTransaction(
    operation: string,
    txFactory: () => Promise<ContractTransactionResponse>,
    notes?: string,
): Promise<Metric> {
    const startedAt = Date.now();
    const tx = await txFactory();
    const receipt = await tx.wait();
    const endedAt = Date.now();

    if (!receipt) {
        throw new Error(`Transaction receipt was null for operation '${operation}'`);
    }

    return {
        operation,
        gasUsed: receipt.gasUsed,
        latencyMs: endedAt - startedAt,
        notes,
    };
}

async function measureRead(
    operation: string,
    reader: () => Promise<unknown>,
    notes?: string,
): Promise<Metric> {
    const startedAt = Date.now();
    await reader();
    const endedAt = Date.now();

    return {
        operation,
        latencyMs: endedAt - startedAt,
        notes,
    };
}

async function main() {
    const { ethers, } = await hre.network.connect();
    const [owner] = await ethers.getSigners();
    const iterations = Number(process.env.EVAL_ITERATIONS ?? "3");

    const IoTDeviceRegistry = await ethers.getContractFactory("IoTDeviceRegistry");
    const deviceRegistry = await IoTDeviceRegistry.deploy();
    await deviceRegistry.waitForDeployment();

    const IoTDataRegistry = await ethers.getContractFactory("IoTDataRegistry");
    const dataRegistry = await IoTDataRegistry.deploy(await deviceRegistry.getAddress());
    await dataRegistry.waitForDeployment();

    const metrics: Metric[] = [];

    console.log("\n=== Evaluation Run ===");
    console.log(`Network          : localhost`);
    console.log(`Iterations       : ${iterations}`);
    console.log(`Registry Address : ${await deviceRegistry.getAddress()}`);
    console.log(`Data Address     : ${await dataRegistry.getAddress()}`);

    for (let index = 0; index < iterations; index += 1) {
        const deviceId = `eval-device-${index + 1}`;
        const reading = `temperature:${25 + index}`;
        const dataHash = ethers.keccak256(ethers.toUtf8Bytes(reading));

        metrics.push(
            await measureTransaction(
                "registerIoTDevice",
                () => deviceRegistry.connect(owner).registerIoTDevice(deviceId),
                `deviceId=${deviceId}`,
            ),
        );

        metrics.push(
            await measureTransaction(
                "authenticateIoTDevice",
                () => deviceRegistry.connect(owner).authenticateIoTDevice(deviceId),
                `deviceId=${deviceId}`,
            ),
        );

        metrics.push(
            await measureTransaction(
                "storeDataHash",
                () => dataRegistry.connect(owner).storeDataHash(deviceId, dataHash),
                `deviceId=${deviceId}`,
            ),
        );

        metrics.push(
            await measureRead(
                "getDeviceDataHash",
                () => dataRegistry.connect(owner).getDeviceDataHash(deviceId, 0),
                `deviceId=${deviceId}`,
            ),
        );

        metrics.push(
            await measureTransaction(
                "deauthenticateIoTDevice",
                () => deviceRegistry.connect(owner).deauthenticateIoTDevice(deviceId),
                `deviceId=${deviceId}`,
            ),
        );

        const storedHash = await dataRegistry.connect(owner).getDeviceDataHash(deviceId, 0);
        const originalIsValid = storedHash === dataHash;
        const tamperedHash = ethers.keccak256(ethers.toUtf8Bytes(`${reading}-tampered`));
        const tamperedIsValid = storedHash === tamperedHash;

        console.log(`\nIteration ${index + 1}`);
        console.log(`  Device ID                : ${deviceId}`);
        console.log(`  Original verification    : ${originalIsValid ? "valid" : "invalid"}`);
        console.log(`  Tampered verification    : ${tamperedIsValid ? "valid" : "invalid"}`);
    }

    const grouped = new Map<string, Metric[]>();
    for (const metric of metrics) {
        grouped.set(metric.operation, [...(grouped.get(metric.operation) ?? []), metric]);
    }

    console.log("\n=== Summary ===");
    for (const [operation, items] of grouped.entries()) {
        const gasValues = items
            .map((item) => item.gasUsed)
            .filter((value): value is bigint => value !== undefined);
        const latencyValues = items.map((item) => item.latencyMs);

        console.log(`\n${operation}`);
        if (gasValues.length > 0) {
            console.log(`  Average gas used : ${averageBigInt(gasValues).toString()}`);
        }
        console.log(`  Average latency  : ${average(latencyValues).toFixed(2)} ms`);
        console.log(`  Samples          : ${items.length}`);
    }

    console.log("\n=== Interpretation Notes ===");
    console.log("- Gas used measures blockchain execution cost for state-changing operations.");
    console.log("- Latency on localhost reflects local prototype overhead, not public-chain latency.");
    console.log("- Provenance verification is valid only when the recomputed hash matches the stored hash.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
