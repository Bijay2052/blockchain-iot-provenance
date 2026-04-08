import random
from datetime import datetime


class IoTDataGenerator:
    def __init__(self, device_id, device_type):
        self.device_id = device_id
        self.device_type = device_type
    
    def generate_sensor_data(self):
        # Simulate sensor data based on device type
        if self.device_type == "temperature_sensor":
            return round(random.uniform(15.0, 30.0), 2)  # Temperature in Celsius
        elif self.device_type == "humidity_sensor":
            return round(random.uniform(30.0, 70.0), 2)  # Humidity in percentage
        elif self.device_type == "pressure_sensor":
            return round(random.uniform(950.0, 1050.0), 2)  # Pressure in hPa
        else:
            return round(random.uniform(1.0, 100.0), 2) # Generic sensor data
    
    # def register_device(self, account_address):
    #     return self.blockchain_client.register_device(self.device_id, account_address)
    
    # def authenticate_device(self, account_address):
    #     return self.blockchain_client.authenticate_device(self.device_id, account_address)
    
    # def deauthenticate_device(self, account_address):
    #     return self.blockchain_client.deauthenticate_device(self.device_id, account_address)
    
    # def store_sensor_data(self, data_string, account_address):
    #     data_hash = self.blockchain_client.hash_sensor_data(data_string)
    #     timestamp = int(datetime.utcnow().timestamp())
    #     return self.blockchain_client.store_data_hash(self.device_id, data_hash, timestamp, account_address)
    
    # def get_stored_data_count(self):
    #     return self.blockchain_client.get_device_data_count(self.device_id)
