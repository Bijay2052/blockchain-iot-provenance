import { expect } from "chai";
import hre from "hardhat";

const { ethers, networkHelpers } = await hre.network.connect();

describe("IoTDataRegistry", function () {

    /**
     * Utility helper: deploys fresh DeviceRegistry and IoTDataRegistry instances.
     * Returns connected contract objects and signer accounts for tests.
     */
    async function deployContract() {
        // Deploy the Device Registry contract first
        const IoTDeviceRegistry = await ethers.getContractFactory("IoTDeviceRegistry");
        const deviceRegistry = await IoTDeviceRegistry.deploy();
        await deviceRegistry.waitForDeployment();
        
        // Deploy the Data Registry contract
        const IoTDataRegistry = await ethers.getContractFactory("IoTDataRegistry");
        const dataRegistry = await IoTDataRegistry.deploy(await deviceRegistry.getAddress());
        await dataRegistry.waitForDeployment();

        const [owner, user1, user2] = await ethers.getSigners();

        return { deviceRegistry, dataRegistry, owner, user1, user2 };
    }

    it("Should allow authenticated devices to register data correctly", async function () {
        // Setup: deploy fresh contracts and set up owner account.
        const { deviceRegistry, dataRegistry, owner } = await deployContract();
        
        const deviceId = "sensor-1";
        const dataHash = ethers.keccak256(ethers.toUtf8Bytes("temperature:25"));

        // Register and authenticate the device first
        await deviceRegistry.connect(owner).registerIoTDevice(deviceId);
        await deviceRegistry.connect(owner).authenticateIoTDevice(deviceId);

        // Now register the data
        await dataRegistry.connect(owner).storeDataHash(deviceId, dataHash);

        // Assert: retrieving the stored data hash by index returns exact value.
        const storedHashes = await dataRegistry.getDeviceDataHash(deviceId, 0);
        expect(storedHashes).to.equal(dataHash);
    });
    
    it("Should not allow unauthenticated devices to register data", async function () {
        // Setup: deploy contracts and register device as un-authenticated.
        const { deviceRegistry, dataRegistry, owner } = await deployContract();
        const deviceId = "sensor-1";
        const dataHash = ethers.keccak256(ethers.toUtf8Bytes("temperature:25"));

        // Register the device but do not authenticate to trigger failure condition.
        await deviceRegistry.connect(owner).registerIoTDevice(deviceId);

        // Attempt to register data should fail
        await expect(dataRegistry.connect(owner).storeDataHash(deviceId, dataHash)).to.be.revertedWith("Device is not authenticated!!");
    });

    it("Should fail if the device is not registered", async function () {
        // Setup: deploy contracts without registering device.
        const { dataRegistry, owner } = await deployContract();
        const deviceId = "sensor-1";
        const dataHash = ethers.keccak256(ethers.toUtf8Bytes("temperature:25"));

        // Attempt to register data for an unregistered device should fail
        await expect(dataRegistry.connect(owner).storeDataHash(deviceId, dataHash)).to.be.revertedWith("Device not registered in the system!!");
    });

    it("Should allow retrieval of all data hashes for a device", async function () {
        // Setup: deploy contracts and register + authenticate device.
        const { deviceRegistry, dataRegistry, owner } = await deployContract();
        
        const deviceId = "sensor-1";
        const dataHash1 = ethers.keccak256(ethers.toUtf8Bytes("temperature:25"));
        const dataHash2 = ethers.keccak256(ethers.toUtf8Bytes("humidity:60"));

        // Register and authenticate the device first.
        await deviceRegistry.connect(owner).registerIoTDevice(deviceId);
        await deviceRegistry.connect(owner).authenticateIoTDevice(deviceId);

        // Store multiple hashes in the data registry.
        await dataRegistry.connect(owner).storeDataHash(deviceId, dataHash1);
        await dataRegistry.connect(owner).storeDataHash(deviceId, dataHash2);

        // Retrieve the stored hashes
        const storedHash1 = await dataRegistry.connect(owner).getDeviceDataHash(deviceId, 0);
        const storedHash2 = await dataRegistry.connect(owner).getDeviceDataHash(deviceId, 1);
        
        expect(storedHash1).to.equal(dataHash1);
        expect(storedHash2).to.equal(dataHash2);
    });

    it("Should fail if trying to retrieve data for an unregistered device", async function () {
        // Setup: deploy contracts and do not register device.
        const { dataRegistry, owner } = await deployContract();
        const deviceId = "sensor-1";

        // Attempt to retrieve data for an unregistered device should fail
        await expect(dataRegistry.connect(owner).getDeviceDataHash(deviceId, 0)).to.be.revertedWith("Device not registered in the system!!");
    });

    it("Should not allow non-owners to register data for a device", async function () {
        // Setup: deploy contracts, register + authenticate device with owner account.
        const { deviceRegistry, dataRegistry, owner, user1 } = await deployContract();
        
        const deviceId = "sensor-1";
        const dataHash = ethers.keccak256(ethers.toUtf8Bytes("temperature:25"));

        // Register and authenticate the device with the owner account.
        await deviceRegistry.connect(owner).registerIoTDevice(deviceId);
        await deviceRegistry.connect(owner).authenticateIoTDevice(deviceId);
        
        // Attempt to register data with a different user should fail
        await expect(dataRegistry.connect(user1).storeDataHash(deviceId, dataHash)).to.be.revertedWith("Only device owner can store data for the device!!");
    });

    it("Should not allow unauthenticated device to store data which was previously registered and authenticated", async function () {
        // Setup: deploy contracts, register + authenticate device, then de-authenticate.
        const { deviceRegistry, dataRegistry, owner } = await deployContract();
        
        const deviceId = "sensor-1";
        const dataHash = ethers.keccak256(ethers.toUtf8Bytes("temperature:25"));

        // Register and authenticate the device first.
        await deviceRegistry.connect(owner).registerIoTDevice(deviceId);
        await deviceRegistry.connect(owner).authenticateIoTDevice(deviceId);

        // De-authenticate the device to trigger failure condition.
        await deviceRegistry.connect(owner).deauthenticateIoTDevice(deviceId);
        
        // Attempt to register data should fail
        await expect(dataRegistry.connect(owner).storeDataHash(deviceId, dataHash)).to.be.revertedWith("Device is not authenticated!!");
    });

    it("Should allow retrieval of historical data for a deauthenticated device", async function () {
        // Setup: deploy contracts, register + authenticate device, store data, then deauthenticate.
        const { deviceRegistry, dataRegistry, owner } = await deployContract();
        
        const deviceId = "sensor-1";
        const dataHash = ethers.keccak256(ethers.toUtf8Bytes("temperature:25"));

        // Register and authenticate the device first.
        await deviceRegistry.connect(owner).registerIoTDevice(deviceId);
        await deviceRegistry.connect(owner).authenticateIoTDevice(deviceId);

        // Store data for the authenticated device.
        await dataRegistry.connect(owner).storeDataHash(deviceId, dataHash);

        // Deauthenticate the device. Historical provenance should remain readable.
        await deviceRegistry.connect(owner).deauthenticateIoTDevice(deviceId);
        
        const storedHash = await dataRegistry.connect(owner).getDeviceDataHash(deviceId, 0);
        expect(storedHash).to.equal(dataHash);
    });

    it("Should not allow invalid index access when retrieving data hashes", async function () {
        // Setup: deploy contracts, register + authenticate device, store one data hash.
        const { deviceRegistry, dataRegistry, owner } = await deployContract();
        
        const deviceId = "sensor-1";
        const dataHash = ethers.keccak256(ethers.toUtf8Bytes("temperature:25"));

        // Register and authenticate the device first.
        await deviceRegistry.connect(owner).registerIoTDevice(deviceId);
        await deviceRegistry.connect(owner).authenticateIoTDevice(deviceId);

        // Store one data hash for the authenticated device.
        await dataRegistry.connect(owner).storeDataHash(deviceId, dataHash);
        
        // Attempt to retrieve a non-existent index should fail
        await expect(dataRegistry.connect(owner).getDeviceDataHash(deviceId, 1)).to.be.revertedWith("Data index out of bounds!!");
    });

});
