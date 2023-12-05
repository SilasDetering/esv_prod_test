/**
 * Stellt funktionen zur Token-/Sessionverwaltung bereit (Schnittstelle zum Session Model)
*/
const jwt = require('jsonwebtoken');
const config = require('../config/database');

// Laufzeit eines Tokens in Tagen:
tokenRuntime = 7;

/**
 * Erstellt ein neues Anmeldetoken und fügt es in den Session-Storage hinzu. 
 * msToken ist Standartmäßig null für die direkte Anmeldung.
 */
module.exports.createNewToken = function (user) {
    const { password, ...userWithoutPassword } = user.toJSON();
    const token = jwt.sign(userWithoutPassword, config.secret, { expiresIn: tokenRuntime + "d" });
    return token;
}