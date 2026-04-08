import json
import os
from pathlib import Path
from dotenv import load_dotenv
from web3 import Web3

project_root = Path(__file__).resolve().parent.parent

# Load environment variables from .env file
env_path = project_root / '.env'
load_dotenv(dotenv_path=env_path)

class BlockchainClient:
    def __init__(self):
        # Initialize Web3 connection
        rpc_url = os.getenv('RPC_URL')
        if not rpc_url:
            raise Exception("RPC_URL is not set in the environment")

        self.web3 = Web3(Web3.HTTPProvider(rpc_url))

        if not self.web3.is_connected():
            raise Exception("Failed to connect to Hardhat node")
        
        print(f"Connected to blockchain: {self.web3.is_connected()}")
        
        # Load contract ABIs and addresses from environment variables
        self.private_key = self._require_env('PRIVATE_KEY')
        self.device_registry_address = self._load_checksum_address(
            'DEVICE_REGISTRY_CONTRACT_ADDRESS',
            'DEVICE_REGISTRY_ADDRESS',
        )
        self.data_registry_address = self._load_checksum_address(
            'DATA_REGISTRY_CONTRACT_ADDRESS',
            'DATA_REGISTRY_ADDRESS',
        )
        
        device_registry_artifact = project_root / "artifacts/contracts/IoTDeviceRegistry.sol/IoTDeviceRegistry.json"
        data_registry_artifact = project_root / "artifacts/contracts/IoTDataRegistry.sol/IoTDataRegistry.json"

        self.device_registry_abi = self._load_abi(device_registry_artifact)
        self.data_registry_abi = self._load_abi(data_registry_artifact)

        
        # Create contract instances
        self.device_registry = self.web3.eth.contract(address=self.device_registry_address, abi=self.device_registry_abi)
        self.data_registry = self.web3.eth.contract(address=self.data_registry_address, abi=self.data_registry_abi)

    def _load_abi(self, artifact_path):
        with open(artifact_path) as f:
            artifact = json.load(f)
            return artifact['abi']

    def _require_env(self, env_name):
        value = os.getenv(env_name)
        if not value:
            raise Exception(f"{env_name} is not set in the environment")
        return value

    def _load_checksum_address(self, *env_names):
        for env_name in env_names:
            value = os.getenv(env_name)
            if value:
                return Web3.to_checksum_address(value)
        raise Exception(f"Missing required address environment variable. Expected one of: {', '.join(env_names)}")

    def _checksum_address(self, address):
        if not address:
            raise Exception("Account address is required")
        return Web3.to_checksum_address(address)

    def _normalize_bytes32(self, value):
        if isinstance(value, bytes):
            if len(value) != 32:
                raise Exception("bytes32 value must be exactly 32 bytes long")
            return value

        if not isinstance(value, str):
            raise Exception("bytes32 value must be a hex string or bytes")

        hex_value = value[2:] if value.startswith("0x") else value
        if len(hex_value) != 64:
            raise Exception("bytes32 hex value must be 64 hex characters long")

        return Web3.to_bytes(hexstr=f"0x{hex_value}")

    def _build_tx_params(self, account_address):
        nonce = self.web3.eth.get_transaction_count(account_address)

        return {
            'from': account_address,
            'nonce': nonce,
            'chainId': self.web3.eth.chain_id,
            'gas': 200000,
            "gasPrice": self.web3.to_wei("2", "gwei")
        }
    
    def _send_transaction(self, tx):
        signed_tx = self.web3.eth.account.sign_transaction(tx, private_key=self.private_key)
        tx_hash = self.web3.eth.send_raw_transaction(signed_tx.raw_transaction)
        receipt = self.web3.eth.wait_for_transaction_receipt(tx_hash)
        return receipt

    def register_device(self, device_id, account_address):
        account = self._checksum_address(account_address)
        tx = self.device_registry.functions.registerIoTDevice(device_id).build_transaction(
            self._build_tx_params(account)
        )

        return self._send_transaction(tx)
    
    def authenticate_device(self, device_id, account_address):
        account = self._checksum_address(account_address)
        tx = self.device_registry.functions.authenticateIoTDevice(device_id).build_transaction(
            self._build_tx_params(account)
        )
        
        return self._send_transaction(tx)
    
    def deauthenticate_device(self, device_id, account_address):
        account = self._checksum_address(account_address)
        tx = self.device_registry.functions.deauthenticateIoTDevice(device_id).build_transaction(
            self._build_tx_params(account)
        )

        return self._send_transaction(tx)
    
    def store_data_hash(self, device_id, data_hash, account_address):
        account = self._checksum_address(account_address)
        normalized_hash = self._normalize_bytes32(data_hash)
        tx = self.data_registry.functions.storeDataHash(device_id, normalized_hash).build_transaction(
            self._build_tx_params(account)
        )
        
        return self._send_transaction(tx)
    
    def hash_sensor_data(self, data):
        if isinstance(data, (dict, list)):
            payload = json.dumps(data, sort_keys=True)
        else:
            payload = str(data)

        return self.web3.keccak(text=payload).hex()
            
    def get_device_data_hash(self, device_id, index):
        stored_hash = self.data_registry.functions.getDeviceDataHash(device_id, index).call()
        if isinstance(stored_hash, bytes):
            return stored_hash.hex()
        return stored_hash
    
    def verify_data_hash(self, device_id, index, provided_data):
        stored_hash = self.get_device_data_hash(device_id, index)
        computed_hash = self.hash_sensor_data(provided_data)

        return {
            "device_id": device_id,
            "index": index,
            "provided_data": provided_data,
            "computed_hash": computed_hash,
            "stored_hash": stored_hash,
            "is_valid": stored_hash.lower() == computed_hash.lower()
        }
    
    def get_device_data_count(self, device_id):
        return self.data_registry.functions.getDeviceDataCount(device_id).call()
    
    def get_device_info(self, device_id):
        return self.device_registry.functions.devices(device_id).call()
    
    def is_device_authenticated(self, device_id):
        print(f"Checking authentication status for device '{device_id}'...")
        _, is_authenticated = self.get_device_info(device_id)

        return is_authenticated

    def device_exists(self, device_id):
        device_owner, _ = self.get_device_info(device_id)
        return device_owner != "0x0000000000000000000000000000000000000000"
