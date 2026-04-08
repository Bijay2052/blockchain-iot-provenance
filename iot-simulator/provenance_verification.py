from blockchain_client import BlockchainClient

class ProvenanceVerifier:
    def __init__(self):
        self.blockchain_client = BlockchainClient()
    
    def verify_data(self, device_id, index, data_reading):

        result = self.blockchain_client.verify_data_hash(device_id, index, data_reading)

        print("\n=== Verification Result ===")
        print(f"Device ID      : {result['device_id']}")
        print(f"Record Index   : {result['index']}")
        print(f"Provided Data  : {result['provided_data']}")
        print(f"Computed Hash  : {result['computed_hash']}")
        print(f"Stored Hash    : {result['stored_hash']}")
        
        if result["is_valid"]:
            print("[VALID] Data is authentic and matches blockchain record.")
        else:
            print("[TAMPERED] Data does NOT match blockchain record.")

        return result
