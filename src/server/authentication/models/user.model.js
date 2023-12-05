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
 * @param callback 
 * @throws err, if DB throws err
 */
module.exports.initialConf = function (callback) {
    User.countDocuments({})
    .then((number) => {
        if(number <= 0){
            this.addUser(defaultAdmin, callback);
        }
    })
    .catch((err) => {
        throw err;
    })
}

/**
 * Fügt einen neuen Benutzer in die Datenbank hinzu
 * @param newUser neuer Benutzer als JSON Objekt
 * @param callback callback Funktion, gibt [err] im Fehlerfall zurück
 */
module.exports.addUser = function (newUser, callback) {
    bcrypt.genSalt(10, (err, salt) => {
        if(err) throw err;
        // Überprüfen, ob newUser definiert und password vorhanden ist
        if (newUser && newUser.password) {
            // Passwort des Users peppern
            newUser.password = newUser.password + pepper;

            // Passwort verschlüsseln
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser.save({newUser})
                .catch((err) => {
                    callback(err);
                })
            });

        } else {
            // Fehlerbehandlung, wenn newUser oder password fehlt
            callback("Fehlende Benutzerdaten");
        }
    });
}

/**
 * Gibt einen User anhand seiner ID zurück.
 * @param id ID des Users der zurückgegeben werden soll.
 * @param callback [err] im Fehlerfall, [User] falls ein zur ID passender User gefunden wurde.
 */
module.exports.getUserById = function (id, callback) {
    User.findById(id, callback);
}

/**
 * Gibt einen User anhand seines Usernames zurück
 * @param username Username 
 * @param callback [err] im Fehlerfall, [User] falls ein zum Username passender User gefunden wurde.
 */
module.exports.getUserByUsername = function (username, callback) {
    const query = { username: username };
    User.findOne(query, callback);
}

/**
 * Vergleicht ein übergebenes Passwort mit dem Hash eines anderen Passwort
 * @param candidatePassword zu testendes Passwort.
 * @param hash Passwort mit dem [candidatePasword] verglichen werden soll.
 * @param callback [err] im Fehlerfall, [isMatch] true falls beide Passwörter übereinstimmen, sonst false
 */
module.exports.comparePassword = function (candidatePassword, hash, callback) {
    candidatePassword = candidatePassword + pepper;
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if (err) throw err;
        callback(null, isMatch);
    });
}

/**
 * Überschreibt die Daten eines Users anhand seines früheren Benutzernamens.
 * @param username Benutzername anhand dessen das User-Objekt gefunden wird.
 * @param newUserInformation Neue Benutzerdaten mit denen die alten Benutzerdaten überschrieben werden sollen.
 * @param callback [err] im Fehlerfall.
 */
module.exports.updateUser = function(username, newUserInformation, callback) {
    const query = { username: username };
    User.updateOne(query, newUserInformation, callback);
}

/**
 * Löscht den Benutzer anhand seines Benutzernamens
 * @param username Benutzername anhand dessen das User-Objekt gefunden wird.
 * @param callback [err] im Fehlerfall, [User] gelöschtes Objekt
 */
module.exports.deleteUser = function (username, callback) {
    const query = { username: username };
    User.findOneAndDelete(query, callback);
}

/**
 * Gibt eine Liste aller User in der Datenbank zurück
 * @param callback [err] im Fehlerfall, [Userlist] Liste aller Benutzer
 */
module.exports.getUserList = function (callback) {
    const projection = {__v: 0, password: 0}
    User.find({}, projection, callback).sort({firstName: 1});
}

/**
 * Überschreibt das Password eines Benutzers 
 * @param username Benutzername anhand dessen das User-Objekt gefunden wird.
 * @param password neues Password
 * @param callback [err] im Fehlerfall, [modifiedCount] anzahl der überschriebenen Objekte, 
 *                 [matchedCount] anzahl der zum Benutzernamen passenden Dokumente
 */
module.exports.changePassword = function (username, password, callback) {
    // Password Peppern
    password = password + pepper
    
    // Password Hashen
    bcrypt.genSalt(10, (err, salt) => {
        if(err) throw err;
        bcrypt.hash(password, salt, (err, hash)=>{
            if(err) throw err;
            const query = {username: username };
            const update = {password: hash}
            User.updateOne(query, update, callback);
        })
    });
}