
#ifndef PACKET_HANDLER_H
#define PACKET_HANDLER_H

#include <Arduino.h>
#include <heltec.h>

// Structure for storing received data
struct LoRaPacket {
  uint8_t chipId[5];       // Transmitter ID (5 bytes)
  uint8_t modbusData[8];   // Modbus RTU frame (8 bytes)
  int rssi;                // Signal strength
};

// Function prototypes
uint16_t calculateCRC(uint8_t *data, uint8_t len);
void displayReceivedData(const LoRaPacket& packet);
bool processReceivedPacket(int packetSize, LoRaPacket& receivedPacket);
void sendToBackend(const LoRaPacket& packet);
void displayWaitingScreen();

#endif // PACKET_HANDLER_H
