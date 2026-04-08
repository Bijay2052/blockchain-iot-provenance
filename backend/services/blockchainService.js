import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

import DeviceRegistryABI from "../../artifacts/contracts/IoTDeviceRegistry.sol/IoTDeviceRegistry.json" assert { type: "json" };
import DataStorageABI from "../../artifacts/contracts/IoTDataStorage.sol/IoTDataStorage.json" assert { type: "json" };

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const deviceRegistry = new ethers.Contract(
  process.env.DEVICE_REGISTRY_ADDRESS,
  DeviceRegistryABI.abi,
  wallet
);

const dataStorage = new ethers.Contract(
  process.env.DATA_STORAGE_ADDRESS,
  DataStorageABI.abi,
  wallet
);

export { deviceRegistry, dataStorage };
