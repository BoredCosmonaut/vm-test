const express = require('express');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());


const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
  ssl: process.env.PG_SSL === 'true'
});
app.set('db', pool);


const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api', uploadRoutes);

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor...`);
});
