import express from "express";
import { deviceRegistry, dataStorage } from "../services/blockchainService.js";
import { ethers } from "ethers";

const router = express.Router();


// Register Device
router.post("/register-device", async (req, res) => {
  try {
    const { deviceId } = req.body;

    const tx = await deviceRegistry.registerIoTDevice(deviceId);
    await tx.wait();

    res.json({ message: "Device registered", txHash: tx.hash });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Authenticate Device
router.post("/authenticate-device", async (req, res) => {
  try {
    const { deviceId } = req.body;

    const tx = await deviceRegistry.authenticateIoTDevice(deviceId);
    await tx.wait();

    res.json({ message: "Device authenticated", txHash: tx.hash });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Upload Data
router.post("/upload-data", async (req, res) => {
  try {
    const { deviceId, data } = req.body;

    const hash = ethers.keccak256(ethers.toUtf8Bytes(data));

    const tx = await dataStorage.storeDataHash(deviceId, hash);
    await tx.wait();

    res.json({
      message: "Data stored",
      hash,
      txHash: tx.hash
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
