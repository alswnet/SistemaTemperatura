/*jshint esversion: 6 */
const TelegramBot = require("node-telegram-bot-api");

var mqtt = require("mqtt");
var client = mqtt.connect("mqtt://test.mosquitto.org");

var Contastes = require("./Token");

const bot = new TelegramBot(Contastes.token, {
  polling: true
});

var SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");
var MiPuerto = new SerialPort("/dev/ttyACM0", {
  baudRate: 9600,
  autoOpen: true
});
const MiParse = new Readline();
MiPuerto.pipe(MiParse);

var Cliente = 123;
var EsCafe = false;

bot.on("message", msg => {
  const chatId = msg.chat.id;
  Cliente = chatId;
  var Mensaje = msg.text.toLowerCase();
  console.log("El ID del char: " + chatId + " Usuario: " + msg.chat.first_name + " con el mensaje: " + Mensaje);
  if (Mensaje == "temperatura" || Mensaje == "t") {
    console.log("Pidiendo la Temperatura");
    bot.sendMessage(chatId, "Pidiendo la temperatura");
    MiPuerto.write("t");
  } else if (Mensaje == "humedad" || Mensaje == "h") {
    console.log("Pidiendo la Humedad");
    bot.sendMessage(chatId, "Pidiendo la Humedad");
    MiPuerto.write("h");
  } else if (Mensaje == "aparente" || Mensaje == "a") {
    console.log("Pidiendo la Temperatura Aparente");
    bot.sendMessage(chatId, "Pidiendo la Temperatura Aparente");
    MiPuerto.write("a");
  } else if (Mensaje == "cafe" || Mensaje == 'minuta') {
    EsCafe = true;
    bot.sendMessage(chatId, "Investiganco mejor opcion");
    MiPuerto.write("a");
  } else if (Mensaje == "lito") {
    bot.sendMessage(chatId, "Vea este video :) https://www.youtube.com/watch?v=dgS-D7xK_NA&t=2s");
  } else {
    bot.sendMessage(chatId, "No entiendo el mensaje, mi amo");
  }
});

MiParse.setEncoding("utf8");

MiParse.on("data", function(data) {
  console.log("Lo que entro es " + data);
  var Mensaje = data.split(";");
  var Opcion = Mensaje[0].toLowerCase();
  var Valor = Mensaje[1];
  if (EsCafe) {
    Temperatura = parseFloat(Valor);
    console.log("La temperatura es " + Temperatura);
    if (Temperatura > 30) {
      bot.sendMessage(Cliente, "El Bot recomienda Minuta");
    } else {
      bot.sendMessage(Cliente, "El Bot recomienda Cafe");
    }
    EsCafe = false;
  } else if (Opcion == "t") {
    EnviarMQTT("ALSW/Estudio/T", Valor);
    bot.sendMessage(Cliente, "La temperatura es " + Valor + "°C");
  } else if (Opcion == "h") {
    EnviarMQTT("ALSW/Estudio/H", Valor);
    bot.sendMessage(Cliente, "La Humedad es " + Valor + "%");
  } else if (Opcion == "a") {
    EnviarMQTT("ALSW/Estudio/A", Valor);
    bot.sendMessage(Cliente, "La Temperatura Aparente es " + Valor + "°C");
  }
});


function EventoConectar() {
  client.subscribe("ALSW/#", function(err) {
    if (!err) {
      console.log("Conectado a MQTT")
    }
  });
}

function EnviarMQTT(topic, mensaje) {
  if (client.connected) {
    client.publish(topic, mensaje);
  } else {
    console.log("Error, no se puedo mandar mensaje " + topic + " " + mensaje)
  }
}

function EventoMensaje(topic, message) {
  if (topic == "ALSW/temp") {
    console.log("La Temperatura es " + message.toString());
  }
  console.log(topic + " - " + message.toString());
  // client.end()
}

client.on("connect", EventoConectar);
client.on("message", EventoMensaje);
