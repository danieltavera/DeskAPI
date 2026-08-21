require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'reservation-service' }));

const PORT = process.env.RESERVATION_PORT || 3002;
app.listen(PORT, () => console.log(`reservation-service listening on port ${PORT}`));
