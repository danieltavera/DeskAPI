require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'auth-service' }));

const PORT = process.env.AUTH_PORT || 3001;
app.listen(PORT, () => console.log(`auth-service listening on port ${PORT}`));
