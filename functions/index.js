const functions = require('firebase-functions');
const { createMiddleware } = require('./dist/server/entry.mjs'); // Adjust path if necessary
const app = require('express')();

app.use(createMiddleware());

exports.ssr = functions.https.onRequest(app);