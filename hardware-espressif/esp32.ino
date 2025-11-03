#include <WiFi.h>
#include <WebServer.h>
#include "SPIFFS.h"

#define LED_PIN 2
#define WIFI_FILE "/wifi.json"
#define AP_SSID "E-Noki-Setup"

WebServer server(80);
bool isProvisioning = false;  // ✅ flag to control provisioning mode

void runMainProgram() {
  Serial.println("Wi-Fi connected! Running main program...");
  digitalWrite(LED_PIN, HIGH);
  // your main code goes here
}

// ======= SPIFFS Helpers =======

bool saveCredentials(const String &ssid, const String &pass) {
  File f = SPIFFS.open(WIFI_FILE, FILE_WRITE);
  if (!f) return false;
  String json = "{\"ssid\"😕"" + ssid + "\",\"pass\"😕"" + pass + "\"}";
  f.print(json);
  f.close();
  return true;
}

bool readCredentials(String &ssid, String &pass) {
  if (!SPIFFS.exists(WIFI_FILE)) return false;
  File f = SPIFFS.open(WIFI_FILE, FILE_READ);
  if (!f) return false;

  String content = f.readString();
  f.close();

  int s1 = content.indexOf("\"ssid\"😕"");
  int s2 = content.indexOf("\"", s1 + 8);
  int p1 = content.indexOf("\"pass\"😕"");
  int p2 = content.indexOf("\"", p1 + 8);
  if (s1 == -1 || s2 == -1 || p1 == -1 || p2 == -1) return false;
  ssid = content.substring(s1 + 8, s2);
  pass = content.substring(p1 + 8, p2);
  return true;
}

bool tryConnect(const String &ssid, const String &pass, uint32_t timeoutSec = 15) {
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

// ======= HTML Page =======

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
    <label>SSID: <input id="ssid" readonly /></label><br/><br/>
    <label>Password: <input id="pass" type="password" /></label><br/><br/>
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

// ======= Web Handlers =======

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
    json += "{\"ssid\"😕"" + ssid + "\",\"rssi\":" + String(rssi) + ",\"secure\":" + (secure ? "true" : "false") + "}";
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
  String ssid, pass;
  int s1 = body.indexOf("\"ssid\"😕"");
  int s2 = body.indexOf("\"", s1 + 8);
  int p1 = body.indexOf("\"pass\"😕"");
  i