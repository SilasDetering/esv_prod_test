/**
 * User Model für alle Zugriffe auf die User Datenbank.
 * Speichert User mit Username, Password, Vorname, Nachname, Email ab.
*/
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Shema
const UserSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String },
    isAdmin: { type: Boolean },
})

// Verbindung zur User Datenbank
const userDB = mongoose.connection.useDb('userDB');

// User Shema exportieren
const User = module.exports = userDB.model('User', UserSchema);

// Pepper for Password Encryption
const pepper = process.env.PW_PEPPER || 'N4d4pmZtcM5mFW7cnondMRF-FXwVo056'

// Default User
const defaultAdmin = new User({
    username: "admin",
    password: "Passwort1+",     // DEFAUL ADMIN PW
    firstName: "admin",
    lastName: "admin",
    email: "admin@admin.com",
    isAdmin: true
});

/**
 * Fügt einen Default User der Datenbank hinzu, falls kein Benutzer "admin" vorhanden ist
 * @throws err, if DB throws err
 */
module.exports.initialConf = function () {
    User.countDocuments({})
        .then((number) => {
            if (number <= 0) {
                return this.addUser(defaultAdmin);
            }
        })
        .catch((err) => {
            throw err;
        })
}

/**
 * Fügt einen neuen Benutzer in die Datenbank hinzu
 * @param newUser neuer Benutzer als JSON Objekt
 */
module.exports.addUser = async function (newUser) {

    try {
        // Passwort verschlüsseln
        newUser.password = newUser.password + pepper;

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newUser.password, salt);
        newUser.password = hash;

        //Benutzer speichern
        return newUser.save({ newUser });

    } catch (err) {
        throw err;
    }
}

/**
 * Gibt einen User anhand seiner ID zurück.
 * @param id ID des Users der zurückgegeben werden soll.
 */
module.exports.getUserById = function (id) {
    return User.findById(id);
}

/**
 * Gibt einen User anhand seines Usernames zurück
 * @param username Username 
 */
module.exports.getUserByUsername = function (username) {
    const query = { username: username };
    return User.findOne(query);
}

/**
 * Vergleicht ein übergebenes Passwort mit dem Hash eines anderen Passwort
 * @param candidatePassword zu testendes Passwort.
 * @param hash Passwort mit dem [candidatePasword] verglichen werden soll.
 */
module.exports.comparePassword = function (candidatePassword, hash) {
    candidatePassword = candidatePassword + pepper;
    return bcrypt.compare(candidatePassword, hash)
}

/**
 * Überschreibt die Daten eines Users anhand seines früheren Benutzernamens.
 * @param username Benutzername anhand dessen das User-Objekt gefunden wird.
 * @param newUserInformation Neue Benutzerdaten mit denen die alten Benutzerdaten überschrieben werden sollen.
 */
module.exports.updateUser = function (username, newUserInformation) {
    const query = { username: username };
    return User.updateOne(query, newUserInformation);
}

/**
 * Löscht den Benutzer anhand seines Benutzernamens
 * @param username Benutzername anhand dessen das User-Objekt gefunden wird.
 */
module.exports.deleteUser = function (username) {
    const query = { username: username };
    return User.findOneAndDelete(query);
}

/**
 * Gibt eine Liste aller User in der Datenbank zurück
 */
module.exports.getUserList = function () {
    const projection = { __v: 0, password: 0 }
    return User.find({}, projection).sort({ firstName: 1 });
}

/**
 * Überschreibt das Password eines Benutzers 
 * @param username Benutzername anhand dessen das User-Objekt gefunden wird.
 * @param password neues Password
 */
module.exports.changePassword = function (username, password) {
    // Password Peppern
    password = password + pepper

    // Password Hashen
    bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err;
        bcrypt.hash(password, salt, (err, hash) => {
            if (err) throw err;
            const query = { username: username };
            const update = { password: hash }
            return User.updateOne(query, update);
        })
    });
}