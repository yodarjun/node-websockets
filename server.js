'use strict';

const express = require('express');
const { Server } = require('ws');

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new Server({ server });
var total = 0;
var individualCounts = {};
var players = [];

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log('message received: ' + message);
    if (message === "reset") {
      total = 0;
      players.forEach((key) => {
        individualCounts[key] = 0;
      });
    } else if (message === "resetFull") {
      total = 0;
      individualCounts = {}
      players = []
      broadcast("register:" + JSON.stringify(players));
    } else if (message.match(/register:/)) {
      var tmpName = message.split(":")[1];
      individualCounts[tmpName] = 0;
      players.push(tmpName);
      broadcast("register:" + JSON.stringify(players));
    } else {
      total += 1;
      individualCounts[message] += 1;
    }
  });

  ws.on('close', () => console.log('Client disconnected'));
});

setInterval(() => {
  var totalObj = { "total": total };
  var msg = { ...individualCounts, ...totalObj };
  broadcast(JSON.stringify(msg));
}, 10);

function broadcast(msg) {
  wss.clients.forEach((client) => {
    client.send(msg);
  });
};
