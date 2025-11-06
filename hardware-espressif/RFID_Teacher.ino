#include <ESP8266WiFi.h>

// ==== WiFi credentials ====
const char* ssid = "PLDTHOMEFIBRa48a0";
const char* password = "PLDTWIFI2zcp3";

// ==== 74HC595 Pins ====
#define DATA_PIN 13   // D7
#define CLOCK_PIN 12  // D6
#define LATCH_PIN 15  // D8

// ==== LED bit positions ====
#define LED_RED     0
#define LED_GREEN   1
#define LED_BLUE    2
#define LED_YELLOW  3
#define LED_WHITE   4

// 8-bit register (QH..QA)
byte ledState = 0b00000000;

WiFiServer server(80);

void setup() {
  Serial.begin(115200);
  pinMode(DATA_PIN, OUTPUT);
  pinMode(CLOCK_PIN, OUTPUT);
  pinMode(LATCH_PIN, OUTPUT);

  Serial.println("\nConnecting to WiFi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n✅ Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  server.begin();
  updateShiftRegister();
}

void loop() {
  WiFiClient client = server.available();
  if (!client) return;

  Serial.println("New Client Connected!");
  String request = client.readStringUntil('\r');
  Serial.println(request);
  client.flush();

  // === Parse LED commands ===
  if (request.indexOf("/red/on") != -1)     bitSet(ledState, LED_RED);
  if (request.indexOf("/red/off") != -1)    bitClear(ledState, LED_RED);
  if (request.indexOf("/green/on") != -1)   bitSet(ledState, LED_GREEN);
  if (request.indexOf("/green/off") != -1)  bitClear(ledState, LED_GREEN);
  if (request.indexOf("/blue/on") != -1)    bitSet(ledState, LED_BLUE);
  if (request.indexOf("/blue/off") != -1)   bitClear(ledState, LED_BLUE);
  if (request.indexOf("/yellow/on") != -1)  bitSet(ledState, LED_YELLOW);
  if (request.indexOf("/yellow/off") != -1) bitClear(ledState, LED_YELLOW);
  if (request.indexOf("/white/on") != -1)   bitSet(ledState, LED_WHITE);
  if (request.indexOf("/white/off") != -1)  bitClear(ledState, LED_WHITE);

  updateShiftRegister();

  // === Web Page ===
  String html = "<!DOCTYPE html><html><head><title>ESP8266 LED Control</title>";
  html += "<style>body{text-align:center;font-family:sans-serif;}button{padding:10px 20px;margin:5px;font-size:16px;}</style>";
  html += "</head><body>";
  html += "<h2>ESP8266 + 74HC595 (5 LED Control)</h2>";

  html += "<p>Red LED: <a href='/red/on'><button>ON</button></a><a href='/red/off'><button>OFF</button></a></p>";
  html += "<p>Green LED: <a href='/green/on'><button>ON</button></a><a href='/green/off'><button>OFF</button></a></p>";
  html += "<p>Blue LED: <a href='/blue/on'><button>ON</button></a><a href='/blue/off'><button>OFF</button></a></p>";
  html += "<p>Yellow LED: <a href='/yellow/on'><button>ON</button></a><a href='/yellow/off'><button>OFF</button></a></p>";
  html += "<p>White LED: <a href='/white/on'><button>ON</button></a><a href='/white/off'><button>OFF</button></a></p>";

  html += "<p><b>Register state:</b> ";
  html += String(ledState, BIN);
  html += "</p></body></html>";

  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: text/html");
  client.println();
  client.println(html);

  delay(1);
  Serial.println("Client Disconnected.");
}

void updateShiftRegister() {
  digitalWrite(LATCH_PIN, LOW);
  shiftOut(DATA_PIN, CLOCK_PIN, MSBFIRST, ledState);
  digitalWrite(LATCH_PIN, HIGH);
}
