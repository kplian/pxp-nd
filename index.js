const express = require("express");
const bodyParser = require('body-parser');
const { handleError } = require('./api/PxpError');
const CM = require("./api/ControlMiddle");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// Validate if it's an api request
app.post('/api/*', async function (req, res, next) {
  cm = new CM('POST', req, res, next);
  await cm.processRequest();
});
app.get('/api/*', function (req, res, next) {
  cm = new CM('GET', req, res, next);
});
app.put('/api/*', function (req, res, next) {
  cm = new CM('PUT', req, res, next);
});
app.delete('/api/*', function (req, res, next) {
  cm = new CM('DELETE', req, res, next);
});
app.options('/api/*', function (req, res, next) {
  cm = new CM('OPTIONS', req, res, next);
});

app.use((err, req, res, next) => {
  handleError(err, res);
});


// If it's not an api request, let react router handle it
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(3000, () => {
  console.log("El servidor está inicializado en el puerto 3000");
});
