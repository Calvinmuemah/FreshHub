#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <DHT.h>
#include <Wire.h>
#include <Adafruit_INA219.h>

// WiFi
#define WIFI_SSID "YOUR_WIFI"
#define WIFI_PASSWORD "YOUR_PASSWORD"

// Firebase
#define FIREBASE_HOST "your-project.firebaseio.com"
#define FIREBASE_AUTH "your-database-secret"

// DHT
#define DHTPIN D4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// Relay
#define RELAY_PIN D1

// Voltage
#define VOLTAGE_PIN A0

// Current Sensor
Adafruit_INA219 ina219;

// Firebase object
FirebaseData firebaseData;

void setup() {
  Serial.begin(115200);

  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH); // OFF initially

  dht.begin();
  ina219.begin();

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected!");

  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
}

void loop() {
  // 🌡️ Read DHT
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("DHT error");
    return;
  }

  // 🔋 Read Voltage
  int raw = analogRead(VOLTAGE_PIN);
  float voltage = raw * (3.3 / 1023.0);  // adjust based on divider

  // ⚡ Read Current
  float current_mA = ina219.getCurrent_mA();

  // ❄️ Control Cooling (Relay)
  if (temperature > 10) {
    digitalWrite(RELAY_PIN, LOW);  // ON
  } else if (temperature < 5) {
    digitalWrite(RELAY_PIN, HIGH); // OFF
  }

  // 📡 Send to Firebase
  Firebase.setFloat(firebaseData, "/cold_storage/temperature", temperature);
  Firebase.setFloat(firebaseData, "/cold_storage/humidity", humidity);
  Firebase.setFloat(firebaseData, "/cold_storage/voltage", voltage);
  Firebase.setFloat(firebaseData, "/cold_storage/current_mA", current_mA);

  // Debug
  Serial.print("Temp: "); Serial.println(temperature);
  Serial.print("Humidity: "); Serial.println(humidity);
  Serial.print("Voltage: "); Serial.println(voltage);
  Serial.print("Current (mA): "); Serial.println(current_mA);

  delay(5000); // 5 seconds
}