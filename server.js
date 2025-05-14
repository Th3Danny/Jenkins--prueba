const express = require('express');
const helmet = require('helmet');

const app = express();
app.use(helmet());
app.use(express.json());

app.get('/healthcheck', (_req, res) => {
  res.status(200).json({ status: 'prod', timestamp: new Date().toISOString() });
});

app.get('/names', (_req, res) => {
  res.status(200).json({ author: 'Gerson Daniel' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Healthcheck service running on port ${PORT}`);
});