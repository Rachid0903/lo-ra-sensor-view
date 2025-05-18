
#ifndef CONFIG_H
#define CONFIG_H

// LoRa configuration
#define BAND 868E6          // Frequency band in MHz
#define LORA_SYNC_WORD 0x12 // Synchronization word
#define LORA_SF 9           // Spreading factor
#define LORA_BW 125E3       // Bandwidth
#define LORA_CR 5           // Coding rate
#define LORA_PREAMBLE_LEN 8 // Preamble length

// WiFi and backend configuration
extern const char* ssid;
extern const char* password;
extern const char* serverUrl;

// Timeouts (in milliseconds)
#define PACKET_TIMEOUT 10000 // 10 seconds timeout for packet reception

#endif // CONFIG_H
