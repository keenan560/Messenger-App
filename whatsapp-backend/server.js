const express = require("express");
const Pusher = require("pusher");
const mongoose = require("mongoose");
const Message = require("./dbMessages");
const cors = require("cors");

// app config

const app = express();
const port = process.env.PORT || 9000;
const pusher = new Pusher({
  appId: "1086150",
  key: "99bf9a6c0643269f762a",
  secret: "16465ebf36c8c9592ca0",
  cluster: "us2",
  encrypted: true,
});

// middleware
app.use(express.json());
app.use(cors());

// DB config
const connection_url =
  "mongodb+srv://admin:b35HfG0k2ucEKu4H@cluster0.8ub9x.mongodb.net/whatsappdb?retryWrites=true&w=majority";

mongoose.connect(connection_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ??

const db = mongoose.connection;
db.once("open", () => {
  console.log("DB is connected");

  const msgCollection = db.collection("messages");
  const changeStream = msgCollection.watch();

  changeStream.on("change", (change) => {
    console.log(change);

    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        name: messageDetails.name,
        messsage: messageDetails.message,
        timestamp: messageDetails.timestamp,
        received: messageDetails.received,
      });
    } else {
      console.log("Error triggering Pusher");
    }
  });
});

// apit routes
app.get("/", (req, res) => {
  res.send("hello");
});

app.get("/messages/sync", (req, res) => {
  Message.find((err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.post("/messages/new", (req, res) => {
  const dbMessage = req.body;
  console.log(`this is the body >>> ${dbMessage}`);

  Message.create(dbMessage, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

// app listen
app.listen(port, () => console.log(`Listening on localhost:${port}`));
