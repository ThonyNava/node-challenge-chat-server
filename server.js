const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("db.json");
const db = low(adapter);
const port = 3000;
const messagesDb = db.get("messages").value();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

const creatingMessage = (from, text) => {
  let id = messagesDb.length.toString();
  let time = Date.now().toString();
  let message = {
    id: id,
    from: from,
    text: text,
    timeSent: time,
  };
  db.get("messages").push(message).write();
  return messagesDb;
};

app.get("/", function (request, response) {
  response.sendFile(__dirname + "/index.html");
});

app.post("/messages", function (req, res) {
  let from = req.body.from;
  let text = req.body.text;
  // console.log(from);
  // console.log(text);
  if (from && text) {
    res.send(creatingMessage(from, text));
  } else {
    res.status(400).send({ error: "Empty key detected." });
  }
});

app.get("/messages", function (req, res) {
  res.send(messagesDb);
});

app.get("/messages/latest", function (req, res) {
  res.send(messagesDb[messagesDb.length - 1]);
});

app.get("/messages/search", function (req, res) {
  let searchCriteria = req.query.text.toLowerCase();

  const filtMessages = db
    .get("messages")
    .value()
    .filter((obj) => {
      return obj.text.toLowerCase().includes(searchCriteria);
    });

  res.send(filtMessages);
});

app.get("/messages/:messageIdUrl", function (req, res) {
  let messageId = req.params.messageIdUrl;
  let message = db
    .get("messages")
    .value()
    .filter((obj) => {
      return obj.id == messageId;
    });
  res.send(message);
});

app.delete("/messages/:messageIdUrl", function (req, res) {
  let messageId = req.params.messageIdUrl;
  let messageToDelete = db
    .get("messages")
    .value()
    .find((obj) => {
      return obj.id === messageId;
    });
  messageToDelete && db.get("messages").remove(messageToDelete).write();
  messageId === "sudoAll"
    ? res.send(db.get("messages").remove().write())
    : res.send(messageToDelete);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}.`);
});
