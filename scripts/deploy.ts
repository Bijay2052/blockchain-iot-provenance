import hre from "hardhat";

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

    console.log("IoTDeviceRegistry deployed to:", await deviceRegistry.getAddress());
    console.log("IoTDataRegistry deployed to:", await dataRegistry.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
