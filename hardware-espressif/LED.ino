#include <ESP8266WiFi.h>
#include <ArduinoWebsockets.h>
#include <ArduinoJson.h>
using namespace websockets;

const char* ssid = "HUAWEI-2.4G-CkYD";
const char* password = "*****";
const char* wsUrl = "ws://192.168.18.111:8000/esp"; // <-- your backend IP here

const char* enokiLED = "ENOKI-5-PORT-SCANNER-rev0.10beta";
const char* enokiUniq = "e75f428a-0fb1-40e9-bd88-15c4313ed23e";
const char* enokiInst = "898b4819-1877-41b4-aae4-d16f571ddb3b";

// 74HC595 Pins
#define DATA_PIN 13
#define CLOCK_PIN 12
#define LATCH_PIN 15

// LED bit positions
#define LED_RED     0
#define LED_GREEN   1
#define LED_BLUE    2
#define LED_YELLOW  3
#define LED_WHITE   4

byte ledState = 0b00000000;
WebsocketsClient ws;

struct LedInf {
  int addr;
  const char* uq;
  const char* color;
};

LedInf ledList[] = {
  {LED_RED, "f23c991d", "red"},
  {LED_GREEN, "a3337cd6", "green"},
  {LED_BLUE, "56c10d14", "blue"},
  {LED_YELLOW, "459a6ad0", "yellow"},
  {LED_WHITE, "635ee1a3", "white"}
};

void updateShiftRegister() {
  digitalWrite(LATCH_PIN, LOW);
  shiftOut(DATA_PIN, CLOCK_PIN, MSBFIRST, ledState);
  digitalWrite(LATCH_PIN, HIGH);
}

void setup() {
  Serial.begin(115200);
  pinMode(DATA_PIN, OUTPUT);
  pinMode(CLOCK_PIN, OUTPUT);
  pinMode(LATCH_PIN, OUTPUT);

  Serial.println("\nConnecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }

  Serial.println("\n✅ WiFi Connected");
  Serial.println(WiFi.localIP());

  // Connect WebSocket
  
  Serial.println("\nConnecting to ws...");
  ws.connect(wsUrl);
  Serial.println("\nConnected.");

  // === On message from backend ===
  ws.onMessage([](WebsocketsMessage message) {
    String payload = message.data();
    Serial.println("WS received: " + payload);

    DynamicJsonDocument doc(256);
    deserializeJson(doc, payload);
    String type = doc["type"];

    if (type == "update") {
      ledState = doc["state"];
      Serial.print("Updated LED state: ");
      Serial.println(ledState, BIN);
      updateShiftRegister();

      // confirm back
      DynamicJsonDocument ack(128);
      ack["type"] = "confirm";
      ack["state"] = ledState;
      String out;
      serializeJson(ack, out);
      ws.send(out);
    }
  });

   updateShiftRegister();
  // === Send initial sync ===
  DynamicJsonDocument init(512);
  init["type"] = "init";
  init["currentState"] = ledState;
   init["deviceSID"] = enokiUniq;
   init["name"] = enokiLED;
   init["institutionId"] = enokiInst;

  JsonArray leds = init.createNestedArray("ledArray");
  for (int i = 0; i < 5; i++) {
    JsonObject ledObj = leds.createNestedObject();
    ledObj["idx"] = ledList[i].addr;
    ledObj["ledUq"] = ledList[i].uq;
    ledObj["color"] = ledList[i].color;
  }

  String initJson;
  serializeJson(init, initJson);
  ws.send(initJson);

}

void loop() {
  ws.poll();
}
