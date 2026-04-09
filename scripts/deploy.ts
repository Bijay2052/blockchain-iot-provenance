import hre from "hardhat";
import { promises as fs } from "node:fs";
import path from "node:path";

async function upsertEnvValue(filePath: string, key: string, value: string) {
    let content = "";

    try {
        content = await fs.readFile(filePath, "utf8");
    } catch (error) {
        content = "";
    }

    const line = `${key}=${value}`;
    const pattern = new RegExp(`^${key}=.*$`, "m");

    if (pattern.test(content)) {
        content = content.replace(pattern, line);
    } else {
        content = content.trimEnd();
        content = content ? `${content}\n${line}\n` : `${line}\n`;
    }

    await fs.writeFile(filePath, content, "utf8");
}

async function main() {
    const { ethers } = await hre.network.connect();

    // Deploy the Device Registry contract first
    const IoTDeviceRegistry = await ethers.getContractFactory("IoTDeviceRegistry");
    const deviceRegistry = await IoTDeviceRegistry.deploy();
    await deviceRegistry.waitForDeployment();
    
    // Deploy the Data Registry contract
    const IoTDataRegistry = await ethers.getContractFactory("IoTDataRegistry");
    const dataRegistry = await IoTDataRegistry.deploy(await deviceRegistry.getAddress());
    await dataRegistry.waitForDeployment();

    const deviceRegistryAddress = await deviceRegistry.getAddress();
    const dataRegistryAddress = await dataRegistry.getAddress();

    const envPath = path.resolve(process.cwd(), ".env");
    await upsertEnvValue(envPath, "DEVICE_REGISTRY_CONTRACT_ADDRESS", deviceRegistryAddress);
    await upsertEnvValue(envPath, "DATA_REGISTRY_CONTRACT_ADDRESS", dataRegistryAddress);
    
    console.log("IoTDeviceRegistry deployed to:", deviceRegistryAddress);
    console.log("IoTDataRegistry deployed to:", dataRegistryAddress);
    console.log(`Updated contract addresses in ${envPath}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
