#include <Arduino.h>
#include <EEPROM.h>

#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>

#include <ArduinoJson.h>

#include <WebSocketsClient.h>
#include <SocketIOclient.h>

#include <Hash.h>

#include <DHT.h>

#include <StreamUtils.h>

#define DHTTYPE DHT11

ESP8266WiFiMulti WiFiMulti;
SocketIOclient socketIO;

#define USE_SERIAL Serial

enum ModuleCommands
{
  Set,
  Configure,
  ConfigureResponse,
  GetDevicesStatus,
  SetDevicesStatus,
  ChangeDeviceStatus,
  DeviceStatusChanged,
  DevicePinError,
  SetToken,
  ResetToken
};

enum DeviceType
{
  None,
  TemperatureSensor,
  RgbLight
};

static const char *commands_str[] = {"module:set", "module:configure", "module:configure-response", "module:get-devices-status", "module:set-devices-status", "module:change-device-status", "module:device-status-changed", "module:device-pin-error", "module:set-token", "module:reset-token"};
static const char *type_str[] = {"NONE", "TEMPERATURE_SENSOR", "RGB_LIGHT"};

String getType(int enum_val)
{
  return String(type_str[enum_val]);
}

const char *getCommand(int enum_val)
{
  return commands_str[enum_val];
}

typedef struct
{
  float temperature;
  float humidity;
  float old_temperature;
  float old_humidity;
  //DHT dht = DHT(99, DHT11);
} device_temperature_sensor;

typedef struct
{
  int red_pin;
  int green_pin;
  int blue_pin;
  int red_pin_status;
  int green_pin_status;
  int blue_pin_status;
  int old_red_pin_status;
  int old_green_pin_status;
  int old_blue_pin_status;
} device_rgb_light;

typedef struct
{
  int id;
  String type;
  int pin;
  int pin_check;
  bool is_analog;
  bool is_submodule;
  bool is_configured;
  int pin_status;
  int old_pin_status;
  int readings[3][10];
  int num_of_readings;
  union
  {
    device_rgb_light rgb_light;
    device_temperature_sensor temperature_sensor;
  };

  void set_pin_modes()
  {
    if (is_submodule)
      return;

    if (type == getType(TemperatureSensor))
    {
      //temperature_sensor.dht = DHT(pin, DHT11);
      //temperature_sensor.dht.begin();
    }
    else if (type == getType(RgbLight))
    {
      pinMode(pin, OUTPUT);
      pinMode(rgb_light.red_pin, OUTPUT);
      pinMode(rgb_light.green_pin, OUTPUT);
      pinMode(rgb_light.blue_pin, OUTPUT);
      if (pin_check != -1)
        pinMode(pin, INPUT);
    }
    else
    {
      pinMode(pin, OUTPUT);
      if (pin_check != -1)
        pinMode(pin_check, INPUT);
    }
  }
  void read_pin()
  {
    if (is_submodule)
      return;

    if (type == getType(TemperatureSensor))
    {
      //temperature_sensor.temperature = temperature_sensor.dht.readTemperature();
      //temperature_sensor.humidity = temperature_sensor.dht.readHumidity();
    }
    else if (type == getType(RgbLight))
    {
      readings[0][num_of_readings] = pulseIn(rgb_light.red_pin, 1, 10000) / 8;
      readings[1][num_of_readings] = pulseIn(rgb_light.green_pin, 1, 10000) / 8;
      readings[2][num_of_readings] = pulseIn(rgb_light.blue_pin, 1, 10000) / 8;
      num_of_readings++;
      if (num_of_readings >= 10)
      {
        int red_total;
        int green_total;
        int blue_total;
        for (int i = 0; i < num_of_readings; i++)
        {
          red_total += readings[0][i];
          green_total += readings[1][i];
          blue_total += readings[2][i];
        }

        int red_average = red_total / num_of_readings;
        int green_average = green_total / num_of_readings;
        int blue_average = blue_total / num_of_readings;

        int threshold = 2;

        //123 > 120+5 || 123 < 120-5
        if (rgb_light.red_pin_status > red_average + threshold || rgb_light.red_pin_status < red_average - threshold)
        {
          rgb_light.red_pin_status = red_average;
          Serial.print("Red: ");
          Serial.println(rgb_light.red_pin_status);
        }
        if (rgb_light.green_pin_status > green_average + threshold || rgb_light.green_pin_status < green_average - threshold)
        {
          rgb_light.green_pin_status = green_average;
          Serial.print("Green: ");
          Serial.println(rgb_light.green_pin_status);
        }
        if (rgb_light.blue_pin_status > blue_average + threshold || rgb_light.blue_pin_status < blue_average - threshold)
        {
          rgb_light.blue_pin_status = blue_average;
          Serial.print("Blue: ");
          Serial.println(rgb_light.blue_pin_status);
        }
        num_of_readings = 0;
        memset(readings, NULL, sizeof(readings));
      }
    }

    if (is_analog)
    {
      if (pin_check != -1)
        pin_status = analogRead(pin_check);
      else
        pin_status = analogRead(pin);
    }
    else
    {
      if (pin_check != -1)
        pin_status = digitalRead(pin_check);
      else
        pin_status = digitalRead(pin);
    }
  }
  void write_pin(int value)
  {
    if (is_submodule)
      return;

    if (value <= 1)
      digitalWrite(pin, value);
    else
      analogWrite(pin, value);
  }
  void write_pin(int redValue, int greenValue, int blueValue)
  {
    if (is_submodule)
      return;

    analogWrite(rgb_light.red_pin, redValue);
    analogWrite(rgb_light.green_pin, greenValue);
    analogWrite(rgb_light.blue_pin, blueValue);
  }
  void set_old_status()
  {
    read_pin();
    old_pin_status = pin_status;

    if (type == getType(TemperatureSensor))
    {
      temperature_sensor.old_temperature = temperature_sensor.temperature;
      temperature_sensor.old_humidity = temperature_sensor.humidity;
    }
    else if (type == getType(RgbLight))
    {
      rgb_light.old_red_pin_status = rgb_light.red_pin_status;
      rgb_light.old_green_pin_status = rgb_light.green_pin_status;
      rgb_light.old_blue_pin_status = rgb_light.blue_pin_status;
    }
  };
  bool should_update()
  {
    if (pin_status != old_pin_status)
      return true;
    else if (type == getType(TemperatureSensor))
    {
      if (isnan(temperature_sensor.temperature) || isnan(temperature_sensor.humidity))
        return false;
      if (temperature_sensor.temperature != temperature_sensor.old_temperature)
        return true;
      else if (temperature_sensor.humidity != temperature_sensor.old_humidity)
        return true;
    }
    else if (type == getType(RgbLight))
    {
      if (num_of_readings < 10)
        return false;
      else if (rgb_light.red_pin_status != rgb_light.old_red_pin_status)
        return true;
      else if (rgb_light.green_pin_status != rgb_light.old_green_pin_status)
        return true;
      else if (rgb_light.blue_pin_status != rgb_light.old_blue_pin_status)
        return true;
    }

    return false;
  };

} device;

device devices[20];

int nextIndex = 0;

void socketIOEvent(socketIOmessageType_t type, uint8_t *payload, size_t length);
void sendJsonNewStatus(device &device, DynamicJsonDocument doc);
void writeTokenToEEPROM(int offset, const String &token);
DynamicJsonDocument getNamedDoc(const char *name);
void sendEvent(DynamicJsonDocument doc);
void setNewDeviceStatus(device &device);
String readTokenFromEEPROM(int offset);
void sendEmptyEvent(const char *name);
void sendJsonDevices();
void sendJsonRequestDeviceStatus();
const char *getCommand(int enum_val);
String getType(int enum_val);
void processNewData();
void sendJsonClear();
void sendDevices();

void socketIOEvent(socketIOmessageType_t type, uint8_t *payload, size_t length)
{
  switch (type)
  {
  case sIOtype_DISCONNECT:
    USE_SERIAL.printf("[IOc] Disconnected!\n");
    break;
  case sIOtype_CONNECT:
  {
    USE_SERIAL.printf("[IOc] Connected to url: %s\n", payload);
    socketIO.send(sIOtype_CONNECT, "/");

    delay(1000);

    DynamicJsonDocument sendDoc = getNamedDoc(getCommand(Set));

    String token = readTokenFromEEPROM(0);
    sendDoc[1] = token;
    sendEvent(sendDoc);

    if (token != "" || token != NULL)
    {
      USE_SERIAL.print("\nTOKEN: ");
      USE_SERIAL.print(token);
      USE_SERIAL.print("\n");
    }
    else
    {
      USE_SERIAL.println("TOKEN NOT FOUND");
      sendEmptyEvent(getCommand(Set));
    }
    break;
  }
  case sIOtype_EVENT:
  {
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, payload);
    String event = doc[0];
    if (event == getCommand(Configure))
    {
      sendJsonClear();
      // ["module:configure", [{ pinConfiguration: { pin: 5, pin_check: 14 }, id: 0 }, { pinConfiguration: { pin: 4, pin_check: 12 }, id: 1 }]]
      USE_SERIAL.println("here");
      memset(devices, NULL, sizeof(devices));
      nextIndex = 0;
      for (int i = 0; i < doc[1].size(); i++)
      {
        int id = doc[1][i]["id"];
        String type = doc[1][i]["type"];
        int pin = doc[1][i]["pinConfiguration"]["pin"];
        int pin_check = doc[1][i]["pinConfiguration"]["pinCheck"] | -1;
        bool is_analog = doc[1][i]["isAnalog"];
        bool is_submodule = doc[1][i]["isSubmodule"];

        device newDevice{};

        if (type == getType(TemperatureSensor))
        {
          //device temperature(id, type, pin, pin_check, false);
          device temperature{id, type, pin, pin_check, is_analog, is_submodule};
          //newDevice = test;
          // ((Temperature *)&devices[devices.size() - 1])->dht = DHT(pin, DHT11);
          // ((Temperature *)&devices[devices.size() - 1])->dht.begin();
        }
        else if (type == getType(RgbLight))
        {
          int red_pin = doc[1][i]["pinConfiguration"]["redPin"];
          int green_pin = doc[1][i]["pinConfiguration"]["greenPin"];
          int blue_pin = doc[1][i]["pinConfiguration"]["bluePin"];
          device rgbLight{id, type, pin, pin_check, false, is_submodule};
          rgbLight.rgb_light.red_pin = red_pin;
          rgbLight.rgb_light.green_pin = green_pin;
          rgbLight.rgb_light.blue_pin = blue_pin;
          newDevice = rgbLight;
        }
        else
        {
          device device{id, type, pin, pin_check, is_analog, is_submodule};
          newDevice = device;
        }

        if (!is_submodule)
        {
          newDevice.is_configured = true;
          newDevice.set_pin_modes();
        }
        devices[nextIndex] = newDevice;
        nextIndex++;
      }

      sendJsonDevices();

      sendEmptyEvent(getCommand(ConfigureResponse));
    }
    else if (event == getCommand(SetToken))
    {
      String newToken = doc[1];
      writeTokenToEEPROM(0, newToken);
      delay(500);
      USE_SERIAL.println(newToken);
      ESP.restart();
    }
    else if (event == getCommand(ResetToken))
    {
      for (int i = 0; i < 512; i++)
      {
        EEPROM.write(i, 0);
      }
      EEPROM.commit();
      delay(500);
      ESP.restart();
    }
    else if (event == getCommand(GetDevicesStatus))
    {
      bool isRequestSent = false;
      for (int i = 0; i < nextIndex; i++)
      {
        device device = devices[i];
        if (device.is_submodule && !isRequestSent && !device.is_configured)
        {
          sendJsonRequestDeviceStatus();
          isRequestSent = true;
          continue;
        }
        else if (!device.is_submodule && !isRequestSent && device.is_configured)
        {
          sendDevices();
        }
      }
    }
    else if (event == getCommand(ChangeDeviceStatus))
    {
      int id = doc[1]["id"];
      String type = doc[1]["type"];
      for (int i = 0; i < nextIndex; i++)
      {
        device device = devices[i];
        if (device.id != id)
          continue;

        if (device.is_submodule)
        {
          sendJsonNewStatus(device, doc);
          continue;
        }

        if (!device.is_analog)
        {
          int futureStatus = doc[1]["status"]["futureStatus"];
          int currentStatus = doc[1]["status"]["currentStatus"];
          int lastStatus = doc[1]["status"]["lastStatus"];
          device.write_pin(futureStatus);
          device.read_pin();
          if ((device.pin_status == 0 && futureStatus == 1) || (device.pin_status == 1 && futureStatus == 0))
          {
            setNewDeviceStatus(device);
            DynamicJsonDocument sendDoc = getNamedDoc(getCommand(DevicePinError));
            JsonObject param = sendDoc.createNestedObject();
            param["id"] = id;
            param["type"] = type;
            param["status"]["futureStatus"] = futureStatus;
            param["status"]["currentStatus"] = currentStatus;
            param["status"]["lastStatus"] = lastStatus;
            sendEvent(sendDoc);
          }
        }
        else if (type == getType(RgbLight))
        {
          int redValue = doc[1]["status"]["redValue"];
          int greenValue = doc[1]["status"]["greenValue"];
          int blueValue = doc[1]["status"]["blueValue"];
          device.write_pin(redValue, greenValue, blueValue);
        }
      }
    }
    break;
  }
  case sIOtype_ACK:
    USE_SERIAL.printf("[IOc] get ack: %u\n", length);
    hexdump(payload, length);
    break;
  case sIOtype_ERROR:
    USE_SERIAL.printf("[IOc] get error: %u\n", length);
    hexdump(payload, length);
    break;
  case sIOtype_BINARY_EVENT:
    USE_SERIAL.printf("[IOc] get binary: %u\n", length);
    hexdump(payload, length);
    break;
  case sIOtype_BINARY_ACK:
    USE_SERIAL.printf("[IOc] get binary ack: %u\n", length);
    hexdump(payload, length);
    break;
  }
}

void setup()
{
  USE_SERIAL.begin(115200);
  Serial1.begin(115200);

  USE_SERIAL.setDebugOutput(true);

  USE_SERIAL.println();
  USE_SERIAL.println();
  USE_SERIAL.println();

  for (uint8_t t = 4; t > 0; t--)
  {
    USE_SERIAL.printf("[SETUP] BOOT WAIT %d...\n", t);
    USE_SERIAL.flush();
    delay(1000);
  }

  // disable AP
  if (WiFi.getMode() & WIFI_AP)
  {
    WiFi.softAPdisconnect(true);
  }

  if (digitalRead(14) == 1)
  {
    WiFiMulti.addAP("LTE_MATIN", "@Matintat1385");
  }
  else
  {
    WiFiMulti.addAP("T@THOTSPOT", "tathotspot");
  }

  //WiFi.disconnect();
  while (WiFiMulti.run() != WL_CONNECTED)
  {
    delay(100);
  }

  String ip = WiFi.localIP().toString();
  USE_SERIAL.printf("[SETUP] WiFi Connected %s\n", ip);

  if (digitalRead(12) == 1)
  {
    socketIO.begin("192.168.1.115", 3001, "/socket.io/?EIO=4");
  }
  else
  {
    socketIO.beginSSL("lumenite.matin-tat.ir", 443, "/socket.io/?EIO=4");
  }

  EEPROM.begin(512);
  delay(500);

  // event handler
  socketIO.onEvent(socketIOEvent);

  //ReadLoggingStream loggingStream(Serial1, USE_SERIAL);
}

int data;

void loop()
{
  processNewData();

  socketIO.loop();
  for (int i = 0; i < nextIndex; i++)
  {
    device device = devices[i];
    device.read_pin();

    if (device.type == getType(TemperatureSensor))
    {
      if (device.should_update())
      {
        setNewDeviceStatus(device);
      }
      device.set_old_status();
    }
    else
    {
      if (device.should_update())
      {
        setNewDeviceStatus(device);
        device.set_old_status();
      }
    }

    devices[i] = device;
  }
}

void setNewDeviceStatus(device &device)
{
  DynamicJsonDocument doc = getNamedDoc(getCommand(DeviceStatusChanged));
  JsonObject param = doc.createNestedObject();
  param["id"] = device.id;
  param["type"] = device.type;

  device.read_pin();
  if (device.type == getType(TemperatureSensor))
  {
    param["status"]["temperature"] = device.temperature_sensor.temperature;
    param["status"]["humidity"] = device.temperature_sensor.humidity;
    param["status"]["currentStatus"] = device.pin_status;
  }
  else if (device.type == getType(RgbLight))
  {
    param["status"]["currentStatus"] = device.pin_status;
    param["status"]["redValue"] = device.rgb_light.red_pin_status;
    param["status"]["greenValue"] = device.rgb_light.green_pin_status;
    param["status"]["blueValue"] = device.rgb_light.blue_pin_status;
  }
  else
  {
    device.write_pin(device.pin_status);
    param["status"]["currentStatus"] = device.pin_status;
  }
  sendEvent(doc);
}

DynamicJsonDocument getNamedDoc(const char *name)
{
  DynamicJsonDocument doc(1024);
  doc[0] = name;
  return doc;
}

void sendJsonClear()
{
  StaticJsonDocument<512> doc;
  doc[0] = "cd";
  serializeJson(doc, Serial1);
}

void sendJsonDevices()
{
  for (int i = 0; i < nextIndex; i++)
  {
    device device = devices[i];
    if (!device.is_submodule)
      continue;

    StaticJsonDocument<512> doc;
    doc[0] = "sd";
    //JsonObject param = doc.createNestedObject();
    doc[1] = device.type;
    doc[2] = device.id;
    doc[3] = device.pin;
    doc[4] = device.pin_check;
    doc[5] = device.is_analog;

    if (device.type == getType(TemperatureSensor))
    {
    }
    else if (device.type == getType(RgbLight))
    {
      doc[6] = device.rgb_light.red_pin;
      doc[7] = device.rgb_light.green_pin;
      doc[8] = device.rgb_light.blue_pin;
    }
    serializeJson(doc, Serial1);
    serializeJson(doc, Serial);
    USE_SERIAL.print("\n");
  }
}

void sendJsonNewStatus(device &device, DynamicJsonDocument doc)
{
  StaticJsonDocument<512> sendDoc;
  sendDoc[0] = "cds";
  // name, id, fs, cs, ls, rv, gv, bv
  sendDoc[1] = device.id;
  int futureStatus = doc[1]["status"]["futureStatus"];
  int currentStatus = doc[1]["status"]["currentStatus"];
  int lastStatus = doc[1]["status"]["lastStatus"];
  sendDoc[2] = futureStatus;
  sendDoc[3] = currentStatus;
  sendDoc[4] = lastStatus;
  if (device.type == getType(TemperatureSensor))
  {
  }
  else if (device.type == getType(RgbLight))
  {
    int redValue = doc[1]["status"]["redValue"];
    int greenValue = doc[1]["status"]["greenValue"];
    int blueValue = doc[1]["status"]["blueValue"];
    sendDoc[5] = redValue;
    sendDoc[6] = greenValue;
    sendDoc[7] = blueValue;
  }
  serializeJson(sendDoc, Serial1);
  serializeJson(sendDoc, Serial);
  USE_SERIAL.print("\n");
}

void sendJsonRequestDeviceStatus()
{
  StaticJsonDocument<128> doc;
  doc[0] = "gds";
  serializeJson(doc, Serial1);
  serializeJson(doc, Serial);
  USE_SERIAL.print("\n");
}

void sendDevices()
{
  DynamicJsonDocument sendDoc = getNamedDoc(getCommand(SetDevicesStatus));
  JsonArray array = sendDoc.createNestedArray();
  for (int i = 0; i < nextIndex; i++)
  {
    device device = devices[i];
    JsonObject param = array.createNestedObject();
    param["id"] = device.id;
    param["type"] = device.type;
    param["status"]["futureStatus"] = -3;
    param["status"]["currentStatus"] = device.pin_status;
    param["status"]["lastStatus"] = -3;
    device.read_pin();
    if (device.type == getType(TemperatureSensor))
    {
      param["status"]["temperature"] = device.temperature_sensor.temperature;
      param["status"]["humidity"] = device.temperature_sensor.humidity;
    }
    else if (device.type == getType(RgbLight))
    {
      param["status"]["redValue"] = device.rgb_light.red_pin_status;
      param["status"]["greenValue"] = device.rgb_light.green_pin_status;
      param["status"]["blueValue"] = device.rgb_light.blue_pin_status;
    }
    devices[i] = device;
  }

  sendEvent(sendDoc);
}

void sendEmptyEvent(const char *name)
{
  DynamicJsonDocument doc(1024);
  doc[0] = name;
  String output;
  serializeJson(doc, output);
  USE_SERIAL.println(output);
  socketIO.sendEVENT(output);
}

void sendEvent(DynamicJsonDocument doc)
{
  String output;
  serializeJson(doc, output);
  USE_SERIAL.println(output);
  socketIO.sendEVENT(output);
}

void writeTokenToEEPROM(int offset, const String &token)
{
  byte len = token.length();
  EEPROM.write(offset, len);

  for (int i = 0; i < len; i++)
  {
    EEPROM.write(offset + i + 1, token[i]);
  }

  EEPROM.commit();
}

String readTokenFromEEPROM(int offset)
{
  int tokenLen = EEPROM.read(offset);
  char data[tokenLen + 1];

  for (int i = 0; i < tokenLen; i++)
  {
    data[i] = EEPROM.read(offset + i + 1);
  }

  data[tokenLen] = '\0';

  return String(data);
}

bool alreadyShown = false;

void processNewData()
{
  if (USE_SERIAL.available())
  {
    StaticJsonDocument<1024> doc;
    DeserializationError err = deserializeJson(doc, USE_SERIAL);

    if (err == DeserializationError::Ok)
    {
      USE_SERIAL.print("Data from Arduino to Nodemcu:\n");
      String output;
      serializeJson(doc, output);
      USE_SERIAL.println(output);
      String event = doc[0];
      if (event == "dsc")
      {
        //name, id, type, s, rv, gv, bv
        int id = doc[1];
        String type = doc[2];
        int status = doc[3];

        for (int i = 0; i < nextIndex; i++)
        {
          device device = devices[i];
          if (device.id != id)
            continue;

          if (type == getType(TemperatureSensor))
          {
            int temperature = doc[4];
            int humidity = doc[5];
            device.temperature_sensor.temperature = temperature;
            device.temperature_sensor.humidity = humidity;
          }
          else if (type == getType(RgbLight))
          {
            int redValue = doc[4];
            int greenValue = doc[5];
            int blueValue = doc[6];
            device.rgb_light.red_pin_status = redValue;
            device.rgb_light.green_pin_status = greenValue;
            device.rgb_light.blue_pin_status = blueValue;
          }
          device.pin_status = status;

          devices[i] = device;
        }
      }
      else if (event == "sds")
      {
        // name, id, type, s, rv, gv, bv
        int id = doc[1];
        String type = doc[2];
        int status = doc[3];

        for (int i = 0; i < nextIndex; i++)
        {
          device device = devices[i];

          if (device.id != id || !device.is_submodule || device.is_configured)
            continue;

          if (device.type == getType(TemperatureSensor))
          {
            int temperature = doc[4];
            int humidity = doc[5];
            device.temperature_sensor.temperature = temperature;
            device.temperature_sensor.humidity = humidity;
          }
          else if (type == getType(RgbLight))
          {
            int redValue = doc[4];
            int greenValue = doc[5];
            int blueValue = doc[6];
            device.rgb_light.red_pin_status = redValue;
            device.rgb_light.green_pin_status = greenValue;
            device.rgb_light.blue_pin_status = blueValue;
          }

          device.pin_status = status;

          device.is_configured = true;
          devices[i] = device;
        }

        bool readyToSend = true;
        for (int i = 0; i < nextIndex; i++)
        {
          device device = devices[i];
          if (device.is_submodule && !device.is_configured)
            readyToSend = false;
        }

        if (readyToSend)
        {
          sendDevices();
        }

        alreadyShown = true;
      }
      else if (event == "dpe")
      {
        int id = doc[1];
        String type = doc[2];
        int futureStatus = doc[3];
        int currentStatus = doc[4];
        int lastStatus = doc[5];

        for (int i = 0; i < nextIndex; i++)
        {
          device device = devices[i];

          if (device.id != id)
            continue;

          USE_SERIAL.println("HELLO");

          DynamicJsonDocument sendDoc = getNamedDoc(getCommand(DevicePinError));
          JsonObject param = sendDoc.createNestedObject();
          param["id"] = id;
          param["type"] = type;
          param["status"]["futureStatus"] = futureStatus;
          param["status"]["currentStatus"] = currentStatus;
          param["status"]["lastStatus"] = lastStatus;
          sendEvent(sendDoc);
        }
      }
      else
      {
        USE_SERIAL.print("deserializeJson() returned ");
        USE_SERIAL.println(err.c_str());

        alreadyShown = true;

        while (USE_SERIAL.available() > 0)
          USE_SERIAL.read();
      }
    }
  }
}