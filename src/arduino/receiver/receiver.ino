
#include <WiFi.h>
#include <heltec.h>
#include "config.h"
#include "packet_handler.h"

// Track last packet time
unsigned long lastPacket = 0;

void setup() {
  // Initialize Heltec board
  Heltec.begin(
    true,   // Enable display
    true,   // Enable LoRa
    true,   // Enable built-in Serial
    true,   // PABOOST
    BAND
  );

  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");

  // Configure LoRa
  LoRa.setSyncWord(LORA_SYNC_WORD);
  LoRa.setSpreadingFactor(LORA_SF);
  LoRa.setSignalBandwidth(LORA_BW);
  LoRa.setCodingRate4(LORA_CR);
  LoRa.setPreambleLength(LORA_PREAMBLE_LEN);
  
  // Start receiver mode
  LoRa.receive();

  // Initial display
  displayWaitingScreen();

  // Debug Serial
  Serial.begin(115200);
  Serial.println("Receiver started!");
  
  // Initialize last packet time
  lastPacket = millis();
}

void loop() {
  int packetSize = LoRa.parsePacket();
  
  if (packetSize) {
    lastPacket = millis(); // Reset timeout on packet reception
    
    LoRaPacket receivedPacket;
    if (processReceivedPacket(packetSize, receivedPacket)) {
      displayReceivedData(receivedPacket);
      sendToBackend(receivedPacket);
    }
  }

  // Timeout: No packet received for defined timeout period
  if (millis() - lastPacket > PACKET_TIMEOUT) {
    Serial.println("Timeout: No packet received for 10 seconds!");
    displayTimeoutScreen();
    lastPacket = millis(); // Reset to avoid spamming
  }
}
