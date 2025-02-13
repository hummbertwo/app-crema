const express = require('express');
const fetch = require('node-fetch');
const app = express();

// Middleware para manejar JSON
app.use(express.json());

// Ruta para la raíz
app.get('/', (req, res) => {
  res.send('¡Servidor funcionando!');
});

// Ruta para manejar el webhook de Slack
app.post('/api/registrar', (req, res) => {
  const { code, name } = req.body;
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!slackWebhookUrl) {
    return res.status(400).send('No se ha configurado la URL del webhook de Slack');
  }

  fetch(slackWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: `Nuevo código QR registrado: ${code} por ${name}` }),
  })
    .then(response => response.json())
    .then(data => {
      res.status(200).send('Mensaje enviado a Slack');
    })
    .catch(error => {
      res.status(500).send('Error al enviar mensaje a Slack');
    });
});

// Puerto donde escuchará el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


