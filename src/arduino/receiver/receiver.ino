
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "VOTRE_SSID";
const char* password = "VOTRE_MOT_DE_PASSE";
const char* serverUrl = "http://localhost:8000/sensor-data/";

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

// Ajouter dans le setup() après la connexion LoRa :
WiFi.begin(ssid, password);
while (WiFi.status() != WL_CONNECTED) {
  delay(500);
  Serial.print(".");
}
Serial.println("\nWiFi connected");
