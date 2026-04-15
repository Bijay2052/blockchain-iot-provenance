from time import time
import os
from dotenv import load_dotenv
from pathlib import Path
from blockchain_client import BlockchainClient
from iot_data_generator import IoTDataGenerator

project_root = Path(__file__).resolve().parent.parent

# Load environment variables from .env file
env_path = project_root / '.env'
load_dotenv(dotenv_path=env_path)

class IoTSimulator:
    def __init__(self):
        self.blockchain_client = BlockchainClient()

        self.account_address = os.getenv('ACCOUNT_ADDRESS')
        if not self.account_address:
            raise Exception("ACCOUNT_ADDRESS is not set in the environment")

        # Store device info locally for simulation purposes
        self.devices = [
            IoTDataGenerator("device_1", "temperature_sensor"),
            IoTDataGenerator("device_2", "humidity_sensor"),
            IoTDataGenerator("device_3", "pressure_sensor")
        ]

        self.generated_data = {}  # To keep track of generated data and on-chain indexes
    
    def setup_devices(self):
        for device in self.devices:
            device_id = device.device_id
            owner, authenticated = self.blockchain_client.get_device_info(device_id)
            print(f"[SETUP] Device '{device_id}', Authenticated: {authenticated}")

            if owner == "0x0000000000000000000000000000000000000000":
                print(f"[SETUP] Registering {device_id}...")
                self.blockchain_client.register_device(device_id, self.account_address)
                print(f"[OK] {device_id} registered")

            owner, authenticated = self.blockchain_client.get_device_info(device_id)

            if not authenticated:
                print(f"[SETUP] Authenticating {device_id}...")
                self.blockchain_client.authenticate_device(device_id, self.account_address)
                print(f"[OK] {device_id} authenticated\n")

    def run_once(self):
        for device in self.devices:
            print(f"\n[DEVICE] {device.device_id}")

            reading = device.generate_sensor_data()
            print(f"Reading: {reading}")

            data_hash = self.blockchain_client.hash_sensor_data(reading)
            print(f"Hash: {data_hash}")

            self.blockchain_client.store_data_hash(device.device_id, data_hash, self.account_address)
            count = self.blockchain_client.get_device_data_count(device.device_id)
            record_index = count - 1

            if device.device_id not in self.generated_data:
                self.generated_data[device.device_id] = []

            self.generated_data[device.device_id].append({
                "index": record_index,
                "reading": reading,
            })

            print(f"[OK] Stored hash on blockchain")
            print(f"[INFO] Total records for {device.device_id}: {count}")

    def run_loop(self, iterations=3, delay=3):
        for i in range(iterations):
            print(f"\n===== Simulation round {i+1} =====")
            self.run_once()
            time.sleep(delay)
