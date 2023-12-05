/**
 * Passport-JS Strategy überprüft nach validierung des JSON-Webtoken, ob der User in der Datenbank vorhanden ist 
*/


const JwtStrategy   = require('passport-jwt').Strategy;
const ExtractJwt    = require('passport-jwt').ExtractJwt;
const User          = require('../models/user.model');
const config        = require('../config/database');

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.MONGO_SECRET || config.secret
}

const strategy = new JwtStrategy(options, (jwt_payload, done) => {

    User.getUserById(jwt_payload._id)
        .then((user) => {
            if(user){
                return done(null, user);
            } else {
                return done(null, false);
            }
        })
        .catch((err) => {
            return done(err, false);
        })
});

module.exports = (passport) => {
    passport.use(strategy);
}