/**
 *  Datenbank, die alle Mitglieder speichert nachdem die Importe gefiltert werden sollen
 *  Mitglieder bestehen aus: MitgliederID, Mitglieder Name
*/

const mongoose = require('mongoose');

// Schemata
const MembersShema = mongoose.Schema({
    ID: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    group: {
        type: String,
        required: false,
    },
    debNr: {
        type: Number,
        required: true,
    },
    grundbeitrag: {
        type: Boolean,
        required: false,
    },
    address: {
        street: {
            type: String,
            required: true,
        },
        zipCode: {
            type: Number,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: false,
        },
    },
});

// Mit ESV Datenbank verbinden
const esvDB = mongoose.connection.useDb('esvDB');

// Schema exportieren
const Members = module.exports = esvDB.model('Members', MembersShema);

/**
 * Fügt ein neues Mitglied in die Datenbank hinzu.
 * @param newMember neues Member Objekt { [memberName], [memberID] }.
 * @param callback [err] im Fehlerfall.
 */
module.exports.addMember = function (newMember, callback) {
    Members.insertMany(newMember, callback)
}

/**
 * Gibt ein Mitglied anhand der memberID zurück.
 * @param id ID des gesuchten Mitgliedes.
 * @param callback [err] im Fehlerfall, [Member] falls ein zur ID passendes Mitglied gefunden wurde.
 */
module.exports.getMemberById = function (id, callback) {
    const projection = { _id: 0, __v: 0 }
    const query = { ID: id };
    Members.findOne(query, projection, callback);
}

/**
 * Sucht ein Mitglied anhand seines Namens in der Datenbank.
 * @param name Name des Mitgliedes.
 * @param callback [err] im Fehlerfall, [Member] falls ein zum Namen passendes Mitglied gefunden wurde.
 */
module.exports.getMemberByName = function (name, callback) {
    const query = { name: name };
    const projection = { _id: 0, __v: 0 }
    Members.findOne(query, projection, callback);
}

/**
 * Gibt eine Liste aller Mitglieder aus der Datenbank zurück.
 * @param callback [err] im Fehlerfall, [MemberList] Liste aller gespeicherten Mitglieder passend zum gewünschten Kontinent.
 */
module.exports.getMemberList = function (callback) {
    const projection = { _id: 0, __v: 0 }
    const query = {};
    Members.find(query, projection, callback).sort({ name: 1 });
}

/**
 * Gibt alle Mitglieder IDs aus, die in der Datenbank gespeichert werden.
 * @param callback [err] im Fehlerfall, [MemberIDs] Mitglieder IDs aller gespeicherten Mitglieder.
 */
module.exports.getListOfMemberIDs = function (callback) {
    Members.distinct("ID", {}, callback);
}

/**
 * Löscht ein Mitglied anhand seiner ID aus der Datenbank.
 * @param id ID des zu löschenden Mitgliedes.
 * @param callback [err] im Fehlerfall, [deletedMember] gelöschtes Mitglied.
 */
module.exports.deleteMember = function (id, callback) {
    const query = { ID: id };
    Members.findOneAndDelete(query, callback);
}

/**
 * Gibt eine Liste von Mitglieder IDs zurück die einer besstimmten Gruppe angehören
 * @param group Gruppe nach der gefiltert werden soll
 * @param callback Liste von Mitglieder IDs einer Gruppe
 */
module.exports.getMemberIDsByGroup = function (group, callback) {
    const projection = { _id: 0, ID: 1 }
    const query = {group: group};
    Members.find(query, projection, callback);
}

/**
 * Gibt zu einem Member alle Gruppenmitglieder zurück
 * @param {*} member Member einer Gruppe
 * @param {*} callback Alle Gruppenmitglieder
 */
module.exports.getGroupMembersByMember = function (group, callback) {
    const query = {group: group}
    const projection = { _id: 0, __v: 0 }
    Members.find(query, projection, callback)
}