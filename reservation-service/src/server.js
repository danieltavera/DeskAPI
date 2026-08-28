require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const resourceRoutes = require('./interfaces/controllers/resourceRoutes');
const resourceTypeRoutes = require('./interfaces/controllers/resourceTypeRoutes');
const bookingRoutes = require('./interfaces/controllers/bookingRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/resources', resourceRoutes);
app.use('/api/resource-types', resourceTypeRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'reservation-service' }));

const PORT = process.env.RESERVATION_PORT || 3002;
app.listen(PORT, () => console.log(`reservation-service listening on port ${PORT}`));
