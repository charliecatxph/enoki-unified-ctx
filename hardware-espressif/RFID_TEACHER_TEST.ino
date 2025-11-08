#include <ESP8266WiFi.h>
#include <ArduinoWebsockets.h>
#include <ArduinoJson.h>
using namespace websockets;

const char* ssid = "PLDTHOMEFIBRa48a0";
const char* password = "PLDTWIFI2zcp3";
const char* wsUrl = "ws://192.168.1.100:3000"; // <-- your backend IP here

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
  ws.connect(wsUrl);

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

  // === Send initial sync ===
  DynamicJsonDocument init(256);
  init["type"] = "init";
  init["state"] = ledState;

  JsonObject leds = init.createNestedObject("leds");
  leds["red"] = LED_RED;
  leds["green"] = LED_GREEN;
  leds["blue"] = LED_BLUE;
  leds["yellow"] = LED_YELLOW;
  leds["white"] = LED_WHITE;

  String initJson;
  serializeJson(init, initJson);
  ws.send(initJson);
}

void loop() {
  ws.poll();
}
