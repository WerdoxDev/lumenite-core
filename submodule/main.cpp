#include <Arduino.h>

#include <ArduinoJson.h>

#include <StreamUtils.h>

#include <DHT.h>

enum DeviceType
{
    None,
    TemperatureSensor,
    RgbLight
};

static const char *type_str[] = {"NONE", "TEMPERATURE_SENSOR", "RGB_LIGHT"};

String getType(int enum_val)
{
    return String(type_str[enum_val]);
}

typedef struct
{
    float temperature;
    float humidity;
    float old_temperature;
    float old_humidity;
    //DHT dht;
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

typedef struct device
{
    int id;
    String type;
    int pin;
    int pin_check;
    bool is_analog;
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
        if (type == getType(TemperatureSensor))
        {
            //temperature_sensor.dht = DHT(pin, DHT11);
            //temperature_sensor.dht.begin();
        }
        else if (type == getType(RgbLight))
        {
            pinMode(rgb_light.red_pin, OUTPUT);
            pinMode(rgb_light.green_pin, OUTPUT);
            pinMode(rgb_light.blue_pin, OUTPUT);
        }

        pinMode(pin, OUTPUT);
        if (pin_check != -1)
            pinMode(pin_check, INPUT);
    }
    void read_pin()
    {
        //noInterrupts();
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
        //interrupts();
    }
    void write_pin(int value)
    {
        if (value <= 1)
            digitalWrite(pin, value);
        else
            analogWrite(pin, value);
    }
    void write_pin(int redValue, int greenValue, int blueValue)
    {
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

void processNewData();
void setNewDeviceStatus(device &device);

device devices[20];

int nextIndex = 0;

void setup()
{
    Serial.begin(115200);
    while (!Serial)
    {
    }

    Serial1.begin(115200);
    Serial.println("Setup done");

    //ReadLoggingStream loggingStream(Serial1, Serial);
}

void loop()
{
    processNewData();

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
                Serial.println(digitalRead(device.pin));
                setNewDeviceStatus(device);
                device.set_old_status();
            }
        }

        devices[i] = device;
    }
}

void processNewData()
{
    if (Serial1.available())
    {
        StaticJsonDocument<1024> doc;
        DeserializationError err = deserializeJson(doc, Serial1);
        serializeJson(doc, Serial);
        Serial.print("\n");

        if (err == DeserializationError::Ok)
        {
            Serial.print("Data from Nodemcu to Arduino:\n");
            String event = doc[0];
            if (event == "cd")
            {
                memset(devices, NULL, sizeof(devices));
                nextIndex = 0;
            }
            else if (event == "sd")
            {
                String type = doc[1];
                int id = doc[2];
                int pin = doc[3];
                int pin_check = doc[4];
                bool is_analog = doc[5];
                Serial.print(type);
                Serial.print(", ");
                Serial.print(pin);
                Serial.print(", ");
                Serial.print(pin_check);
                Serial.print(", ");
                Serial.print(id);
                Serial.print(", ");
                Serial.print(is_analog);
                Serial.println("\n");

                device newDevice;

                if (type == getType(TemperatureSensor))
                {
                    device temperature{id, type, pin, pin_check, false};
                    //newDevice = temperature;
                }
                else if (type == getType(RgbLight))
                {
                    int red_pin = doc[6];
                    int green_pin = doc[7];
                    int blue_pin = doc[8];
                    device rgbLight{id, type, pin, pin_check, false};
                    rgbLight.rgb_light.red_pin = red_pin;
                    rgbLight.rgb_light.green_pin = green_pin;
                    rgbLight.rgb_light.blue_pin = blue_pin;
                    newDevice = rgbLight;
                    Serial.print(red_pin);
                    Serial.print(", ");
                    Serial.print(green_pin);
                    Serial.print(", ");
                    Serial.println(blue_pin);
                }
                else
                {
                    device device{id, type, pin, pin_check, is_analog};
                    newDevice = device;
                }
                newDevice.set_pin_modes();
                devices[nextIndex] = newDevice;
                nextIndex++;
            }
            else if (event == "cds")
            {
                // name, id, fs, cs, ls, rv, gv, bv
                int id = doc[1];
                int futureStatus = doc[2];
                int currentStatus = doc[3];
                int lastStatus = doc[4];

                for (int i = 0; i < nextIndex; i++)
                {
                    device device = devices[i];
                    if (device.id != id)
                        continue;

                    device.write_pin(futureStatus);
                    device.read_pin();
                    if ((device.pin_status == 0 && futureStatus == 1) || (device.pin_status == 1 && futureStatus == 0))
                    {
                        setNewDeviceStatus(device);
                        StaticJsonDocument<512> sendDoc;
                        // name, id, type, fs, cs, la
                        sendDoc[0] = "dpe";
                        sendDoc[1] = id;
                        sendDoc[2] = device.type;
                        sendDoc[3] = futureStatus;
                        sendDoc[4] = currentStatus;
                        sendDoc[5] = lastStatus;
                        serializeJson(sendDoc, Serial1);
                        Serial.println("pinError: ");
                        serializeJson(sendDoc, Serial);
                        Serial.print("\n");
                    }
                    if (device.type == getType(RgbLight))
                    {
                        int redValue = doc[5];
                        int greenValue = doc[6];
                        int blueValue = doc[7];
                        device.write_pin(redValue, greenValue, blueValue);
                    }
                }
            }
            else if (event == "gds")
            {
                for (int i = 0; i < nextIndex; i++)
                {
                    device device = devices[i];
                    device.read_pin();
                    StaticJsonDocument<512> sendDoc;
                    // name, id, type, s, rv, gv, bv
                    sendDoc[0] = "sds";
                    sendDoc[1] = device.id;
                    sendDoc[2] = device.type;
                    sendDoc[3] = device.pin_status;

                    if (device.type == getType(TemperatureSensor))
                    {
                        sendDoc[4] = device.temperature_sensor.temperature;
                        sendDoc[5] = device.temperature_sensor.humidity;
                    }
                    else if (device.type == getType(RgbLight))
                    {
                        sendDoc[4] = device.rgb_light.red_pin_status;
                        sendDoc[5] = device.rgb_light.green_pin_status;
                        sendDoc[6] = device.rgb_light.blue_pin_status;
                    }

                    Serial.print("Id: ");
                    Serial.print(device.id);
                    Serial.print(", Size: ");
                    Serial.println(nextIndex);
                    serializeJson(sendDoc, Serial1);
                }
                Serial.println("gds");
            }
        }
        else
        {
            Serial.print("deserializeJson() returned ");
            Serial.println(err.c_str());

            while (Serial1.available() > 0)
                Serial1.read();
        }
    }
}

void setNewDeviceStatus(device &device)
{
    StaticJsonDocument<512> doc;
    //name, id, type, s, rv, gv, bv
    doc[0] = "dsc";
    doc[1] = device.id;
    doc[2] = device.type;
    doc[3] = device.pin_status;
    device.read_pin();
    if (device.type == getType(TemperatureSensor))
    {
        doc[4] = device.temperature_sensor.temperature;
        doc[5] = device.temperature_sensor.temperature;
    }
    else if (device.type == getType(RgbLight))
    {
        doc[4] = device.rgb_light.red_pin_status;
        doc[5] = device.rgb_light.green_pin_status;
        doc[6] = device.rgb_light.blue_pin_status;
    }
    device.write_pin(device.pin_status);
    serializeJson(doc, Serial1);
}
