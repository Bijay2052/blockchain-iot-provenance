import os
from dotenv import load_dotenv
from pathlib import Path

from iot_simulator import IoTSimulator
from provenance_verification import ProvenanceVerifier

project_root = Path(__file__).resolve().parent.parent

# Load environment variables from .env file
env_path = project_root / '.env'
load_dotenv(dotenv_path=env_path)

def main():
    simulator = IoTSimulator()
    verifier = ProvenanceVerifier()

    print("=== Setting up devices ===")
    simulator.setup_devices()

    print("\n=== Starting IoT simulation ===")
    simulator.run_once()
    # simulator.run_loop(iterations=3, delay=2)

    print("\nSimulation completed successfully.")

    print("\n=== Generated Data for Provenance Verification ===")
    for device_id, data_list in simulator.generated_data.items():
        print(f"Device: {device_id}")
        for item in data_list:
            print(f"  Blockchain Index {item['index']}: {item['reading']}")

    # Verify the first reading generated in this run against its blockchain index
    device_id = "device_1"
    if device_id in simulator.generated_data and len(simulator.generated_data[device_id]) > 0:
        reading_record = simulator.generated_data[device_id][0]
        record_index = reading_record["index"]
        original_data_reading = reading_record["reading"]

        print("\n=== Verifying original reading ===")
        print(f"\n=== Verifying provenance for {device_id} reading at blockchain index {record_index} ===")
    
        verifier.verify_data(device_id, index=record_index, data_reading=original_data_reading)

        print("\n=== Verifying tampered reading ===")
        tampered_data_reading = original_data_reading + 5  # Tamper the data by adding 5
        print(f"\n=== Verifying provenance for {device_id} tampered reading at blockchain index {record_index} ===")
        verifier.verify_data(device_id, index=record_index, data_reading=tampered_data_reading)
    else:
        print(f"No generated data found for {device_id} to verify provenance.")

if __name__ == "__main__":
    main()
