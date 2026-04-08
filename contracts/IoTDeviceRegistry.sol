// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.20;

contract IoTDeviceRegistry {

  // Device struct keeps owner address and authentication status.
  struct Device {
    address owner;
    bool authenticated;
  }

  // List of registered device IDs for enumeration.
  string[] public deviceIds;

  // Public mapping to look up a Device by its ID.
  mapping (string => Device ) public devices;

  // Event fired when a device is registered.
  event DeviceRegistered(string deviceId, address owner);

  // Event fired when a device is authenticated.
  event DeviceAuthenticated(string deviceId, address owner);

  //Event fired when a device is deauthenticated.
  event DeviceDeAuthenticated(string deviceId, address owner);

  /**
   * @dev Register a new IoT device with a unique ID.
   * Requirements:
   * - `_deviceId` must not be empty.
   * - device must not already exist in `devices`.
   */
  function registerIoTDevice(string calldata _deviceId) external {
    require(bytes(_deviceId).length > 0, "Invalid device ID!!");
    require(devices[_deviceId].owner == address(0), "Device already exists in the system!!");

    devices[_deviceId] = Device({
      owner: msg.sender,
      authenticated: false
    });

    deviceIds.push(_deviceId);

    emit DeviceRegistered(_deviceId, msg.sender);
  }

  /**
   * @dev Authenticate a registered device.
   * Requirements:
   * - device must be registered.
   * - caller must be the device owner.
   * - device must not already be authenticated.
   */
  function authenticateIoTDevice(string calldata _deviceId) external {
    require(bytes(_deviceId).length > 0, "Invalid device ID!!");
    require(devices[_deviceId].owner != address(0), "Device not registered in the system!!");
    require(devices[_deviceId].owner == msg.sender, "Only device owner can authenticate the device!!");
    require(!devices[_deviceId].authenticated, "Device is already authenticated!!");

    devices[_deviceId].authenticated = true;

    emit DeviceAuthenticated(_deviceId, msg.sender);
  }

  /**
   * @dev DeviceAuthenticate an authenticated device.
   * Requirements:
   * - device must be registered.
   * - caller must be the device owner.
   * - device must already be authenticated.
   */
  function deauthenticateIoTDevice(string calldata _deviceId) external {
    require(bytes(_deviceId).length > 0, "Invalid device ID!!");
    require(devices[_deviceId].owner != address(0), "Device not registered in the system!!");
    require(devices[_deviceId].owner == msg.sender, "Only device owner can deauthenticate the device!!");
    require(devices[_deviceId].authenticated, "Device is not authenticated!!");

    devices[_deviceId].authenticated = false;

    emit DeviceDeAuthenticated(_deviceId, msg.sender);
  }

}
