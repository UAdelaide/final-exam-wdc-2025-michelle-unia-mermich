var express = require('express');
var path = require('path');
const fs = require('fs');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mysql = require('mysql2/promise');

var indexRouter = require('./routes/index');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

(async () => {
    try {

    // Connect to MySQL without specifying a database
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: ''
    });

    await connection.query('CREATE DATABASE IF NOT EXISTS DogWalkService');
    await connection.end();

    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'DogWalkService'
    });
    const schema = fs.readFileSync(path.join(__dirname, 'dogwalks.sql'), 'utf8');
    await db.query(schema);

      console.log('Connected to DogWalkService');

      await db.execute(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES
      ('alice123', 'alice@example.com', 'hashed123', 'owner'),
      ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
      ('carol123', 'carol@example.com', 'hashed789', 'owner'),
      ('derekdoggo', 'derek@example.com', 'hashed321', 'walker'),
      ('eveowner', 'eve@example.com', 'hashed654', 'owner');
    `);

        await db.execute(`
        INSERT INTO Dogs (owner_id, name, size)
        VALUES
        ((SELECT user_id FROM Users WHERE username='alice123'), 'Max', 'medium'),
        ((SELECT user_id FROM Users WHERE username = 'carol123'), 'Bella', 'small'),
        ((SELECT user_id FROM Users WHERE username = 'bobwalker'), 'Cookie', 'large'),
        ((SELECT user_id FROM Users WHERE username = 'derekdoggo'), 'Marshmallow', 'large'),
        ((SELECT user_id FROM Users WHERE username = 'eveowner'), 'Biscuit', 'medium');
    `);

    await db.execute(`
    INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status)
    VALUES
    ((SELECT dog_id FROM Dogs WHERE name = 'Max'), '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
    ((SELECT dog_id FROM Dogs WHERE name = 'Bella'), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted'),
    ((SELECT dog_id FROM Dogs WHERE name = 'Cookie'), '2025-06-21 10:30:00', 45, 'Adelaide Rundle Mall', 'accepted'),
    ((SELECT dog_id FROM Dogs WHERE name = 'Marshmallow'), '2025-06-21 11:30:00', 60, 'Henley Beach', 'open'),
    ((SELECT dog_id FROM Dogs WHERE name = 'Biscuit'), '2025-06-21 12:30:00', 30, 'Henley Beach', 'cancelled');
`);
app.locals.db = db;
} catch (err) {
    console.error('Error setting up database. Ensure Mysql is running: service mysql start', err);
  }
})();

app.use('/api', indexRouter);

module.exports = app;
