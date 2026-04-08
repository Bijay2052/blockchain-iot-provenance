// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.20;

// Interface of the device registry contract used for verification.
interface DeviceRegistry {
    function devices(string calldata deviceId)
        external
        view
        returns (address owner, bool authenticated);
}

contract IoTDataRegistry {

    // Device registry contract instance for authorization checks.
    DeviceRegistry public registry;

    struct DataRecord {
        bytes32 dataHash;
        uint256 timestamp;
        address submittedBy;
    }
    
    // Device-level data hashes: deviceId => struct of stored data
    mapping(string => DataRecord[]) private _deviceData;

    constructor(address _registryAddress) {
        // Set registry address at deployment.
        registry = DeviceRegistry(_registryAddress);
    }

    // Event emitted when data is stored for a device.
    event DataHashStored(string deviceId, bytes32 dataHash);

    /**
     * @dev Store a hash for an authenticated device.
     * Reverts if device is unregistered or not authenticated.
     */
    function storeDataHash(string calldata _deviceId, bytes32 _dataHash) external {
        (address owner, bool authenticated) = registry.devices(_deviceId);

        require(owner != address(0), "Device not registered in the system!!");
        require(authenticated, "Device is not authenticated!!");
        require(owner == msg.sender, "Only device owner can store data for the device!!");

        _deviceData[_deviceId].push(
            DataRecord({
                dataHash: _dataHash,
                timestamp: block.timestamp,
                submittedBy: msg.sender
            })
        );

        emit DataHashStored(_deviceId, _dataHash);
    }

    /**
     * @dev Retrieve a stored data hash for a device and index.
     * Reverts if device is not registered.
     */
    function getDeviceDataHash(string calldata _deviceId, uint256 index) external view returns (bytes32) {
        (address owner, ) = registry.devices(_deviceId);
        require(owner != address(0), "Device not registered in the system!!");
        require(index < _deviceData[_deviceId].length, "Invalid index");

        return _deviceData[_deviceId][index].dataHash;
    }

    /**
     * @dev Return the data count per device to iterate over records
     */
    function getDeviceDataCount(string calldata _deviceId) external view returns (uint256) {
        (address owner, ) = registry.devices(_deviceId);
        require(owner != address(0), "Device not registered in the system!!");
        return _deviceData[_deviceId].length;
    }

}
