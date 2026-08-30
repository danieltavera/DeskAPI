require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const logRoutes = require('./interfaces/controllers/logRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/logs', logRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'activity-service' }));

const PORT = process.env.ACTIVITY_PORT || 3003;
app.listen(PORT, () => console.log(`activity-service listening on port ${PORT}`));
