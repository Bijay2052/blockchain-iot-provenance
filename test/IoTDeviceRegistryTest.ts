import { expect } from "chai";
import hre from "hardhat";

const { ethers, networkHelpers } = await hre.network.connect();

describe("IoTDeviceRegistry", function () {

    async function deployContract() {
        const IoTDeviceRegistry = await ethers.getContractFactory("IoTDeviceRegistry");
        const contract = await IoTDeviceRegistry.deploy();
        await contract.waitForDeployment();

        const [owner, user1, user2] = await ethers.getSigners();

        return { contract, owner, user1, user2 };
    }

    it("Should allow the device to be registered correctly", async function () {
        const { contract, owner } = await deployContract();
        
        const deviceId = "sensor-1";

        await contract.connect(owner).registerIoTDevice(deviceId);

        const registeredDevice = await contract.devices(deviceId);

        expect(registeredDevice.owner).to.equal(owner.address);
        expect(registeredDevice.authenticated).to.equal(false);
    });

    it("Should not allow duplicate device registration", async function () {
        const { contract, owner } = await deployContract();
        
        const deviceId = "sensor-1";

        await contract.connect(owner).registerIoTDevice(deviceId);

        await expect(contract.connect(owner).registerIoTDevice(deviceId)).to.be.revertedWith("Device already exists in the system!!");
    });

    it("Should allow the owner to authenticate a device", async function () {
        const { contract, owner } = await deployContract();
        
        const deviceId = "sensor-1";

        await contract.connect(owner).registerIoTDevice(deviceId);
        await contract.connect(owner).authenticateIoTDevice(deviceId);
        
        const registeredDevice = await contract.devices(deviceId);
        expect(registeredDevice.authenticated).to.equal(true);
    });

    it("Should not allow non-owners to authenticate a device", async function () {
        const { contract, owner, user1 } = await deployContract();
        const deviceId = "sensor-1";
        
        await contract.connect(owner).registerIoTDevice(deviceId);
        await expect(contract.connect(user1).authenticateIoTDevice(deviceId)).to.be.revertedWith("Only device owner can authenticate the device!!");
    });

    it("Should fail authentication if device is not registered", async function () {
        const { contract, owner } = await deployContract();

        await expect(contract.connect(owner).authenticateIoTDevice("sensor-1")).to.be.revertedWith("Device not registered in the system!!");
    });

    it("Should fail authentication if device is already authenticated", async function () {
        const { contract, owner } = await deployContract();
        
        const deviceId = "sensor-1";

        await contract.connect(owner).registerIoTDevice(deviceId);
        await contract.connect(owner).authenticateIoTDevice(deviceId);
        
        await expect(contract.connect(owner).authenticateIoTDevice(deviceId)).to.be.revertedWith("Device is already authenticated!!");
    });

    it("Should not allow empty device ID registration", async function () {
        const { contract, owner } = await deployContract();

        await expect(
            contract.connect(owner).registerIoTDevice("")
        ).to.be.revertedWith("Invalid device ID!!");
    });

    it("Should not allow empty device ID authentication", async function () {
        const { contract, owner } = await deployContract();

        await expect(
            contract.connect(owner).authenticateIoTDevice("")
        ).to.be.revertedWith("Invalid device ID!!");
    });

    it("Should deauthenticate a device correctly", async function () {
        const { contract, owner } = await deployContract();
        
        const deviceId = "sensor-1";

        await contract.connect(owner).registerIoTDevice(deviceId);
        await contract.connect(owner).authenticateIoTDevice(deviceId);
        await contract.connect(owner).deauthenticateIoTDevice(deviceId);
        
        const registeredDevice = await contract.devices(deviceId);
        expect(registeredDevice.authenticated).to.equal(false);
    });

    it("Should not allow non-owners to deauthenticate a device", async function () {
        const { contract, owner, user1 } = await deployContract();
        
        const deviceId = "sensor-1";

        await contract.connect(owner).registerIoTDevice(deviceId);
        await contract.connect(owner).authenticateIoTDevice(deviceId);

        await expect(contract.connect(user1).deauthenticateIoTDevice(deviceId)).to.be.revertedWith("Only device owner can deauthenticate the device!!");
    });

    it("Should fail deauthentication if device is not registered", async function () {
        const { contract, owner } = await deployContract();

        await expect(contract.connect(owner).deauthenticateIoTDevice("sensor-1")).to.be.revertedWith("Device not registered in the system!!");
    });

    it("Should fail deauthentication if device is not authenticated", async function () {
        const { contract, owner } = await deployContract();
        
        const deviceId = "sensor-1";

        await contract.connect(owner).registerIoTDevice(deviceId);

        await expect(contract.connect(owner).deauthenticateIoTDevice(deviceId)).to.be.revertedWith("Device is not authenticated!!");
    });


    it("Should not allow empty device ID deauthentication", async function () {
        const { contract, owner } = await deployContract();

        await expect(
            contract.connect(owner).deauthenticateIoTDevice("")
        ).to.be.revertedWith("Invalid device ID!!");
    });

});
