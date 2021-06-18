#include "DHT.h"

#define DHTPIN 2
#define DHTTYPE DHT11

#define Temperatura 0
#define Humedad 1
#define Aparente 2

int Led = 13;
float TiempoAnterior = 0;
float TiempoActivo = 3000;
float Mensaje = false;

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  dht.begin();
  Serial.begin(9600);
  pinMode(Led, OUTPUT);
}

void loop() {
  if (Serial.available()) {
    Mensaje =  true;
    TiempoAnterior = millis();
    digitalWrite(Led, 1);
    char Letra = Serial.read();
    switch (Letra) {
      case 't':
      case 'T':
        Serial.print("T;");
        Serial.println(CalculoAmbiente(Temperatura));
        break;
      case 'h':
      case 'H':
        Serial.print("H;");
        Serial.println(CalculoAmbiente(Humedad));
        break;
      case 'a':
      case 'A':
        Serial.print("A;");
        Serial.println(CalculoAmbiente(Aparente));
        break;
    }
  }
  ActualizarLed();
}

float CalculoAmbiente(int Opcion) {
  float T = dht.readTemperature();
  float H = dht.readHumidity();
  switch (Opcion) {
    case Temperatura:
      return T;
      break;
    case  Humedad:
      return H;
      break;
    case Aparente:
      float A = dht.computeHeatIndex(T, H, false);
      return A;
      break;
    default:
      return -100;
      break;
  }
}

void ActualizarLed() {
  if (Mensaje) {
    float TiempoActual = millis();
    if (TiempoActual - TiempoAnterior > TiempoActivo) {
      digitalWrite(Led, 0);
      Mensaje = false;
    }
  }
}
