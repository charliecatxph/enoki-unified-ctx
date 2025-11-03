#include <WiFi.h>
#include <WebServer.h>
#include "SPIFFS.h"
#include <SPI.h>
#include <MFRC522.h>

#define LED_PIN 2
#define WIFI_FILE "/wifi.json"
#define AP_SSID "E-Noki-Setup"
#define AP_PASSWORD ""     // optional; leave empty to create open AP

// RC522 pin definitions (change to match your wiring)
#define SS_PIN 5     // SDA
#define RST_PIN 22   // RST

WebServer server(80);
bool isProvisioning = false;
bool wifiConnected = false;

MFRC522 mfrc522(SS_PIN, RST_PIN); // Create MFRC522 instance

// Forward declarations
bool saveCredentials(const String &ssid, const String &pass);
bool readCredentials(String &ssid, String &pass);
bool tryConnect(const String &ssid, const String &pass, uint32_t timeoutSec = 15);
void runMainProgram();
void handleRoot();
void handleScan();
void handleSave();

const char indexPage[] PROGMEM = R"rawliteral(
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>ESP32 WiFi Setup</title>
  <style>
    body{font-family: Arial; padding: 20px;}
    .net{padding:6px;border:1px solid #ddd;margin:6px 0;cursor:pointer;}
    .selected{background:#efefef;}
    .small{font-size:0.9em;color:#666;}
    #status{margin-top:10px;}
  </style>
</head>
<body>
  <h2>WiFi Setup</h2>
  <p>Click a network below, enter password, and Submit.</p>
  <div id="networks">Scanning...</div>
  <div style="margin-top:12px;">
    <label>SSID: <input id="ssid" type="text" placeholder="Enter Wi-Fi name" /></label><br/><br/>
<label>Password: <input id="pass" type="password" placeholder="Enter Wi-Fi password" /></label><br/><br/>
    <button id="submit">Submit & Save</button>
    <div id="status" class="small"></div>
  </div>

<script>
function scan() {
  fetch('/scan').then(r=>r.json()).then(list=>{
    const container = document.getElementById('networks');
    container.innerHTML = '';
    if(!list.length) { container.innerHTML = '<i>No networks found</i>'; return; }
    list.forEach(n=>{
      const el = document.createElement('div');
      el.className = 'net';
      el.innerHTML = '<b>'+n.ssid+'</b> <span class="small">('+n.rssi+' dBm)'+(n.secure? ' 🔒':'')+'</span>';
      el.onclick = ()=> {
        document.querySelectorAll('.net').forEach(x=>x.classList.remove('selected'));
        el.classList.add('selected');
        document.getElementById('ssid').value = n.ssid;
      };
      container.appendChild(el);
    });
  }).catch(e=>{
    document.getElementById('networks').innerText = 'Scan failed: '+e;
  });
}

document.getElementById('submit').addEventListener('click', ()=>{
  const ssid = document.getElementById('ssid').value;
  const pass = document.getElementById('pass').value;
  if(!ssid){ alert('Choose a network first'); return; }
  document.getElementById('status').innerText = 'Saving...';
  fetch('/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ssid:ssid,pass:pass})})
    .then(r=>r.text())
    .then(t=>{
      document.getElementById('status').innerText = t + ' Restarting...';
    }).catch(e=>{
      document.getElementById('status').innerText = 'Save failed: ' + e;
    });
});

scan();
</script>
</body>
</html>
)rawliteral";

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  // SPIFFS init
  if (!SPIFFS.begin(true)) {
    Serial.println("Failed to mount SPIFFS");
  } else {
    Serial.println("SPIFFS mounted");
  }

  // Initialize SPI bus & MFRC522
  SPI.begin(); // uses default HSPI pins on ESP32
  mfrc522.PCD_Init();
  Serial.println("RC522 initialized");

  // Try to load saved Wi-Fi credentials
  String ssid, pass;
  if (readCredentials(ssid, pass)) {
    Serial.printf("Found saved credentials: SSID='%s'\n", ssid.c_str());
    if (tryConnect(ssid, pass, 15)) {
      wifiConnected = true;
      runMainProgram();
    } else {
      Serial.println("Saved credentials failed - entering provisioning mode");
      wifiConnected = false;
    }
  } else {
    Serial.println("No saved credentials - entering provisioning mode");
  }

  // If not connected, start AP + web server for provisioning
  if (!wifiConnected) {
    isProvisioning = true;

    // Set WiFi to AP mode
    WiFi.mode(WIFI_AP_STA);
    if (strlen(AP_PASSWORD) > 0) {
      WiFi.softAP(AP_SSID, AP_PASSWORD);
      Serial.printf("Started AP '%s' (secured)\n", AP_SSID);
    } else {
      WiFi.softAP(AP_SSID);
      Serial.printf("Started open AP '%s'\n", AP_SSID);
    }
    IPAddress ip = WiFi.softAPIP();
    Serial.print("AP IP: ");
    Serial.println(ip);

    // Setup web routes
    server.on("/", HTTP_GET, handleRoot);
    server.on("/scan", HTTP_GET, handleScan);
    server.on("/save", HTTP_POST, handleSave);
    server.begin();
    Serial.println("Web server started for provisioning");
  }
}

void loop() {
  // Handle web server if provisioning
  if (isProvisioning) {
    server.handleClient();
  }

  // RFID reading - always active
  if ( mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial() ) {
    Serial.print("Card UID: ");
    for (byte i = 0; i < mfrc522.uid.size; i++) {
      if (mfrc522.uid.uidByte[i] < 0x10) Serial.print("0");
      Serial.print(mfrc522.uid.uidByte[i], HEX);
      if (i < mfrc522.uid.size - 1) Serial.print(":");
    }
    Serial.println();
    // If you want to use UID programmatically, convert to String:
    String uidStr = "";
    for (byte i = 0; i < mfrc522.uid.size; i++) {
      if (mfrc522.uid.uidByte[i] < 0x10) uidStr += "0";
      uidStr += String(mfrc522.uid.uidByte[i], HEX);
      if (i < mfrc522.uid.size - 1) uidStr += ":";
    }
    uidStr.toUpperCase();
    // Example: print with a label
    Serial.println("UID (string): " + uidStr);

    // Halt PICC to be ready for next card
    mfrc522.PICC_HaltA();
    mfrc522.PCD_StopCrypto1();

    delay(300); // small delay so the serial output is readable and to debounce
  }

  // You may want to add other background tasks here
}

// ========== Helpers ==========

void runMainProgram() {
  Serial.println("Wi-Fi connected! Running main program...");
  digitalWrite(LED_PIN, HIGH);
  // Add your network-dependent logic here.
  // Example: start client connections, MQTT, HTTP requests, etc.
}

// SPIFFS save (JSON)
bool saveCredentials(const String &ssid, const String &pass) {
  File f = SPIFFS.open(WIFI_FILE, FILE_WRITE);
  if (!f) {
    Serial.println("Failed to open file for writing");
    return false;
  }
  String json = "{\"ssid\":\"" + ssid + "\",\"pass\":\"" + pass + "\"}";
  f.print(json);
  f.close();
  Serial.println("Credentials saved to SPIFFS");
  return true;
}

// SPIFFS read
bool readCredentials(String &ssid, String &pass) {
  if (!SPIFFS.exists(WIFI_FILE)) return false;
  File f = SPIFFS.open(WIFI_FILE, FILE_READ);
  if (!f) {
    Serial.println("Failed to open wifi file for reading");
    return false;
  }
  String content = f.readString();
  f.close();

  int s1 = content.indexOf("\"ssid\":\"");
  if (s1 == -1) return false;
  int s2 = content.indexOf("\"", s1 + 8);
  if (s2 == -1) return false;

  int p1 = content.indexOf("\"pass\":\"");
  if (p1 == -1) return false;
  int p2 = content.indexOf("\"", p1 + 8);
  if (p2 == -1) return false;

  ssid = content.substring(s1 + 8, s2);
  pass = content.substring(p1 + 8, p2);
  return true;
}

// Attempt to connect to WiFi for timeoutSec seconds
bool tryConnect(const String &ssid, const String &pass, uint32_t timeoutSec) {
  Serial.printf("Trying to connect to '%s'\n", ssid.c_str());
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid.c_str(), pass.c_str());

  uint32_t start = millis();
  while (millis() - start < timeoutSec * 1000) {
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("✅ Connected!");
      Serial.print("IP address: ");
      Serial.println(WiFi.localIP());
      return true;
    }
    delay(200);
  }
  Serial.println("❌ Connection attempt timed out.");
  return false;
}

// ========== Web Handlers ==========

void handleRoot() {
  server.send(200, "text/html", indexPage);
}

void handleScan() {
  int n = WiFi.scanNetworks();
  String json = "[";
  for (int i = 0; i < n; ++i) {
    String ssid = WiFi.SSID(i);
    int rssi = WiFi.RSSI(i);
    bool secure = (WiFi.encryptionType(i) != WIFI_AUTH_OPEN);
    json += "{\"ssid\":\"" + ssid + "\",\"rssi\":" + String(rssi) + ",\"secure\":" + (secure ? "true" : "false") + "}";
    if (i < n - 1) json += ",";
  }
  json += "]";
  server.send(200, "application/json", json);
  WiFi.scanDelete();
}

void handleSave() {
  Serial.println("[POST] /save called");
  if (server.method() != HTTP_POST) {
    server.send(405, "text/plain", "Use POST");
    return;
  }

  String body = server.arg("plain");
  if (body.length() == 0) {
    server.send(400, "text/plain", "Empty body");
    return;
  }

  // Simple JSON parsing (expects {"ssid":"...","pass":"..."} )
  int s1 = body.indexOf("\"ssid\":\"");
  int s2 = (s1 == -1) ? -1 : body.indexOf("\"", s1 + 8);
  int p1 = body.indexOf("\"pass\":\"");
  int p2 = (p1 == -1) ? -1 : body.indexOf("\"", p1 + 8);

  if (s1 == -1 || s2 == -1) {
    server.send(400, "text/plain", "Bad JSON: missing ssid");
    return;
  }
  // pass may be empty string ""
  if (p1 == -1 || p2 == -1) {
    // allow empty pass (open network) if JSON includes "pass":""
    // but if pass key not present at all, reject
    if (body.indexOf("\"pass\"") == -1) {
      server.send(400, "text/plain", "Bad JSON: missing pass");
      return;
    }
  }

  String ssid = body.substring(s1 + 8, s2);
  String pass = "";
  if (p1 != -1 && p2 != -1) pass = body.substring(p1 + 8, p2);

  Serial.printf("Saving SSID='%s' PASS='%s'\n", ssid.c_str(), pass.c_str());
  if (!saveCredentials(ssid, pass)) {
    server.send(500, "text/plain", "Failed to save");
    return;
  }

  server.send(200, "text/plain", "Saved");

  // small delay to allow response to be sent to client
  delay(500);
  Serial.println("Restarting to apply new Wi-Fi settings...");
  delay(200);
  ESP.restart();
}
