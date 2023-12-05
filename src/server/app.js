/**
 * App.js ist zuständig für die Initialisierung vom Backend der App.
*/

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const session = require('express-session');
const dbconfig = require('./authentication/config/database');
const User = require('./authentication/models/user.model');

const usersRoutes = require('./authentication/routes/users.route');
const countryRoutes = require('./esv-database/routes/country.route');
const esvDataRoutes = require('./esv-database/routes/esvData.route');
const esvMemberRoutes = require('./esv-database/routes/member.route');
const esvReportRoutesIron = require('./esv-database/routes/esvReportIron.route');
const esvReportRoutesSteel = require('./esv-database/routes/esvReportSteel.route');

// MONGO DB =================================================================================

// Connect To Database
console.log("Connecting to database URL: " + dbconfig.database); // process.env.MONGO_URL || 

mongoose.connect(dbconfig.database); // process.env.MONGO_URL ||
const userDB = mongoose.connection;

mongoose.set('strictQuery', false);

// On Connection
userDB.on('connected', () => {
    console.log('Connected to database');
});

// On Error
userDB.on('error', (err) => {
    console.log('Database error: ' + err);
});

//===========================================================================================

// Init App
const app = express();

app.use(express.urlencoded({ extended: false }));

// Set Port Number
const httpPort = 3000; // process.env.BACKEND_PORT || 

console.log("Server PORT: " + 3000); // process.env.BACKEND_PORT

// CORS Middleware (With the Cors Module any domain can access the app)
app.use(cors());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// BodyParser Middleware (BodyParser parses incomming request bodies so you can grab the data)
app.use(bodyParser.json());

console.log("EXPRESS_SECRET: " + process.env.EXPRESS_SESSION_SECRET);

// Express Session Middleware
app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET || '85771ABF68E41E3220F3BCC0D3570651',
    saveUninitialized: false,
    resave: false
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
require('./authentication/config/passport')(passport);

// ROUTING ==================================================================================

app.use('/users', usersRoutes);
app.use('/countries', countryRoutes);
app.use('/data', esvDataRoutes);
app.use('/members', esvMemberRoutes);
app.use('/reports/iron', esvReportRoutesIron);
app.use('/reports/steel', esvReportRoutesSteel);

// Index Route
app.get('/', (res) => {
    res.send('Invalid Endpoint');
});
app.get('*', (res) => {
    res.send(path.join(__dirname, 'public/index.html'));
});

// ==========================================================================================

// start server
app.listen(httpPort, () => {
    console.log('Server started on port ' + httpPort);
});

// initialise default admin user
User.initialConf((err) => {
    if (err) console.log("Failed to initialize new default admin")
})