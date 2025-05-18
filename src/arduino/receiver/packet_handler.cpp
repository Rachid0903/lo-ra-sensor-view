
#include "packet_handler.h"
#include "config.h"
#include <WiFi.h>
#include <HTTPClient.h>

// Modbus CRC calculation
uint16_t calculateCRC(uint8_t *data, uint8_t len) {
  uint16_t crc = 0xFFFF;
  for (uint8_t pos = 0; pos < len; pos++) {
    crc ^= data[pos];
    for (uint8_t i = 8; i != 0; i--) {
      if (crc & 0x0001) {
        crc >>= 1;
        crc ^= 0xA001;
      } else {
        crc >>= 1;
      }
    }
  }
  return crc;
}

// Display received data on the OLED screen
void displayReceivedData(const LoRaPacket& packet) {
  char buffer[64];
  
  // Convert ID to hexadecimal
  String chipIdStr;
  for (int i = 0; i < 5; i++) {
    char hex[3];
    sprintf(hex, "%02X", packet.chipId[i]);
    chipIdStr += hex;
  }

  // Extract Modbus data
  uint16_t temperature = (packet.modbusData[3] << 8) | packet.modbusData[4]; // Register 0
  uint16_t humidity = (packet.modbusData[5] << 8) | packet.modbusData[6];    // Register 1

  // Update display
  Heltec.display->clear();
  Heltec.display->drawString(0, 0, "ID: " + chipIdStr);
  sprintf(buffer, "Temp: %.1f C", temperature / 10.0);
  Heltec.display->drawString(0, 15, buffer);
  sprintf(buffer, "Hum: %d %%", humidity);
  Heltec.display->drawString(0, 30, buffer);
  sprintf(buffer, "RSSI: %d dBm", packet.rssi);
  Heltec.display->drawString(0, 45, buffer);
  
  Heltec.display->display();

  // Debug Serial output
  Serial.println("Received packet:");
  Serial.println("ID: " + chipIdStr);
  Serial.printf("Modbus Frame=[");
  for (int i = 0; i < 8; i++) {
    Serial.printf("%02X ", packet.modbusData[i]);
  }
  Serial.println("]");
  Serial.printf("Temp: %.1f C\n", temperature / 10.0);
  Serial.printf("Hum: %d %%\n", humidity);
  Serial.println("RSSI: " + String(packet.rssi) + " dBm");
}

// Process a received LoRa packet
bool processReceivedPacket(int packetSize, LoRaPacket& receivedPacket) {
  if (packetSize <= 0) {
    return false;
  }
  
  Serial.printf("Packet received, size: %d\n", packetSize);
  receivedPacket.rssi = LoRa.packetRssi();

  // Check packet size (5 + 8 = 13 bytes)
  if (LoRa.available() < 13) {
    Serial.println("Packet too small!");
    return false;
  }
  
  // Read ID (5 bytes)
  LoRa.readBytes(receivedPacket.chipId, 5);
  
  // Read Modbus frame (8 bytes)
  LoRa.readBytes(receivedPacket.modbusData, 8);

  // Verify CRC
  uint16_t receivedCRC = (receivedPacket.modbusData[7] << 8) | receivedPacket.modbusData[6];
  uint16_t calculatedCRC = calculateCRC(receivedPacket.modbusData, 6);
  
  if (receivedCRC != calculatedCRC) {
    Serial.println("Invalid CRC!");
    Serial.printf("Received CRC: %04X, Calculated CRC: %04X\n", receivedCRC, calculatedCRC);
    Serial.printf("Modbus Frame=[");
    for (int i = 0; i < 8; i++) {
      Serial.printf("%02X ", receivedPacket.modbusData[i]);
    }
    Serial.println("]");
    return false;
  }
  
  return true;
}

// Send data to backend server
void sendToBackend(const LoRaPacket& packet) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    String chipIdStr;
    for (int i = 0; i < 5; i++) {
      char hex[3];
      sprintf(hex, "%02X", packet.chipId[i]);
      chipIdStr += hex;
    }

    uint16_t temperature = (packet.modbusData[3] << 8) | packet.modbusData[4];
    uint16_t humidity = (packet.modbusData[5] << 8) | packet.modbusData[6];

    String payload = String("{\"chip_id\":\"") + chipIdStr + 
                    "\",\"temperature\":" + String(temperature / 10.0, 1) + 
                    ",\"humidity\":" + String(humidity) + 
                    ",\"rssi\":" + String(packet.rssi) + "}";

    int httpResponseCode = http.POST(payload);
    
    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  }
}

// Display waiting screen
void displayWaitingScreen() {
  Heltec.display->clear();
  Heltec.display->drawString(0, 0, "Recepteur LoRa");
  Heltec.display->drawString(0, 20, "En attente...");
  Heltec.display->display();
}

// Display timeout screen
void displayTimeoutScreen() {
  Heltec.display->clear();
  Heltec.display->drawString(0, 0, "Recepteur LoRa");
  Heltec.display->drawString(0, 20, "No packet received!");
  Heltec.display->display();
}
