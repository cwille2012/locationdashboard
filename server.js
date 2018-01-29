'use strict';

const compress = require('compression');
const express = require('express');
const path = require('path');
const server = require('./handlers.js');

const app = express();
const port = process.env.PORT || 8081;

const environment = process.env.NODE_ENV;

console.log('**ready**');

app.disable('etag');
app.use(compress());

app.use('/', express.static(path.join(__dirname)));

app.get('/status', function(req, res, next) {
    res.status(200).send("I'm up!");
});

app.use(function(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});