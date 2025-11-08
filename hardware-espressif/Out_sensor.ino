  /*
    ESP32 + RC522 example
    - Reads RFID UID from MFRC522
    - Formats UID as: [ENOKI-RFID-SIG] XX XX XX XX ...
    - Sends a POST request with JSON payload to an API endpoint
    - Debounces repeated reads: only sends when UID changes (or first seen)
    - Uses Arduino IDE (ESP32 board package)

    Libraries required:
    - SPI (built-in)
    - MFRC522 by miguelbalboa (install from Library Manager)
    - WiFi (built-in)
    - HTTPClient (built-in)
  */

  #include <WiFi.h>
  #include <HTTPClient.h>
  #include <SPI.h>
  #include <MFRC522.h>

  // --------- USER CONFIG ----------
  const char* WIFI_SSID = "HUAWEI-2.4G-CkYD";
  const char* WIFI_PASSWORD = "****";

  const char* API_ENDPOINT = "http://192.168.18.111:8000/api/alpha/out-sens"; // <-- change to your API
  // If using HTTPS, use "https://" and make sure the server certificate or fingerprint is handled.

  const unsigned long WIFI_RETRY_MS = 10000; // how often to try reconnecting WiFi if disconnected
  const unsigned long POST_TIMEOUT_MS = 5000; // HTTP timeout
  // --------------------------------

  // --------- RC522 PIN CONFIG (change if needed) ----------
  // On ESP32 you often connect RC522 this way:
  // MOSI -> 23
  // MISO -> 19
  // SCK  -> 18
  // NSS(SDA) -> 5   (SS pin for RC522)
  // RST -> 22
  // Adjust pins below to match your wiring.
  #define RST_PIN  22
  #define SS_PIN   5
  MFRC522 mfrc522(SS_PIN, RST_PIN);  // Create MFRC522 instance
  // -------------------------------------------------------
            // to debounce repeated tags
  unsigned long lastWiFiCheck = 0;

  void setup() {
    Serial.begin(115200);
    delay(10);
    Serial.println();
    Serial.println("ESP32 RC522 -> POST to API example");

    // Initialize SPI bus (explicitly for ESP32)
    SPI.begin(18, 19, 23, SS_PIN); // SCK, MISO, MOSI, SS (SS param isn't used by SPI.begin but kept for clarity)

    mfrc522.PCD_Init();
    Serial.println("RC522 initialized.");

    connectWiFi();
  }

  void loop() {
    // Maintain WiFi connection (reconnect if needed)
    if (WiFi.status() != WL_CONNECTED) {
      unsigned long now = millis();
      if (now - lastWiFiCheck > WIFI_RETRY_MS) {
        lastWiFiCheck = now;
        connectWiFi();
      }
    }

    // Look for new cards
    if ( ! mfrc522.PICC_IsNewCardPresent()) {
      // no new card
      delay(50);
      return;
    }

    if ( ! mfrc522.PICC_ReadCardSerial()) {
      // couldn't read card
      delay(50);
      return;
    }

    // Build UID string in hex bytes, uppercase, separated by spaces
    String uidHex = "";
    for (byte i = 0; i < mfrc522.uid.size; i++) {
      if (mfrc522.uid.uidByte[i] < 0x10) uidHex += "0";
      uidHex += String(mfrc522.uid.uidByte[i], HEX);
      if (i < mfrc522.uid.size - 1) uidHex += " ";
    }
    uidHex.toUpperCase();

    // Formatted signature
    String formattedUID = "[ENOKI-RFID-SIG] " + uidHex;

    // Debug output
    Serial.print("Card detected: ");
    Serial.println(formattedUID);

      bool ok = sendUidToApi(uidHex, formattedUID);
      if (!ok) {
        Serial.println("POST failed; will not update lastUID so it will retry on next read.");
      }

    // Halt PICC (recommended)
    mfrc522.PICC_HaltA();
    delay(200); // short delay to avoid spamming
  }


  // Connect to WiFi with basic retry/feedback
  void connectWiFi() {
    if (WiFi.status() == WL_CONNECTED) return;
    Serial.print("Connecting to WiFi: ");
    Serial.println(WIFI_SSID);
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    unsigned long start = millis();
    const unsigned long CONNECT_TIMEOUT = 15000; // 15s
    while (WiFi.status() != WL_CONNECTED && millis() - start < CONNECT_TIMEOUT) {
      Serial.print(".");
      delay(500);
    }
    Serial.println();

    if (WiFi.status() == WL_CONNECTED) {
      Serial.print("WiFi connected. IP: ");
      Serial.println(WiFi.localIP());
    } else {
      Serial.println("Failed to connect to WiFi (within timeout). Will retry later.");
    }
  }


  // Sends POST JSON to API_ENDPOINT
  // Returns true if status code 200-299 received
  bool sendUidToApi(const String &uidHex, const String &formattedUID) {
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("WiFi not connected. Cannot send POST.");
      return false;
    }

    HTTPClient http;
    http.setTimeout(POST_TIMEOUT_MS);

    Serial.print("Posting to ");
    Serial.println(API_ENDPOINT);

    // Build JSON payload. Add or remove fields as needed.
    // Example payload:
    // { "uid": "AA BB CC DD", "tag": "[ENOKI-RFID-SIG] AA BB CC DD", "device": "esp32-01" }
  String payload = "{\"employeeRfidHash\":\"" + uidHex + "\"}";

  Serial.println(payload);

    http.begin(API_ENDPOINT);
    http.addHeader("Content-Type", "application/json");

    int httpResponseCode = http.POST(payload);

    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      String resp = http.getString();
      Serial.print("Response body: ");
      Serial.println(resp);
      http.end();
      // treat 2xx as success
      if (httpResponseCode >= 200 && httpResponseCode < 300) return true;
      else return false;
    } else {
      Serial.print("Error on sending POST: ");
      Serial.println(httpResponseCode);
      http.end();
      return false;
    }
  }
