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
 * @returns [err] im Fehlerfall.
 */
module.exports.addMember = function (newMember) {
    return Members.insertMany(newMember)
}

/**
 * Gibt ein Mitglied anhand der memberID zurück.
 * @param id ID des gesuchten Mitgliedes.
 * @returns [err] im Fehlerfall, [Member] falls ein zur ID passendes Mitglied gefunden wurde.
 */
module.exports.getMemberById = function (id) {
    const projection = { _id: 0, __v: 0 }
    const query = { ID: id };
    return Members.findOne(query, projection);
}

/**
 * Sucht ein Mitglied anhand seines Namens in der Datenbank.
 * @param name Name des Mitgliedes.
 * @returns [err] im Fehlerfall, [Member] falls ein zum Namen passendes Mitglied gefunden wurde.
 */
module.exports.getMemberByName = function (name) {
    const query = { name: name };
    const projection = { _id: 0, __v: 0 }
    return Members.findOne(query, projection);
}

/**
 * Gibt eine Liste aller Mitglieder aus der Datenbank zurück.
 * @returns [err] im Fehlerfall, [MemberList] Liste aller gespeicherten Mitglieder passend zum gewünschten Kontinent.
 */
module.exports.getMemberList = function () {
    const projection = { _id: 0, __v: 0 }
    const query = {};
    return Members.find(query, projection).sort({ name: 1 });
}

/**
 * Gibt alle Mitglieder IDs aus, die in der Datenbank gespeichert werden.
 * @returns [err] im Fehlerfall, [MemberIDs] Mitglieder IDs aller gespeicherten Mitglieder.
 */
module.exports.getListOfMemberIDs = function () {
    return Members.distinct("ID", {});
}

/**
 * Löscht ein Mitglied anhand seiner ID aus der Datenbank.
 * @param id ID des zu löschenden Mitgliedes.
 * @returns [err] im Fehlerfall, [deletedMember] gelöschtes Mitglied.
 */
module.exports.deleteMember = function (id) {
    const query = { ID: id };
    return Members.findOneAndDelete(query);
}

/**
 * Gibt eine Liste von Mitglieder IDs zurück die einer besstimmten Gruppe angehören
 * @param group Gruppe nach der gefiltert werden soll
 * @returns Liste von Mitglieder IDs einer Gruppe
 */
module.exports.getMemberIDsByGroup = function (group) {
    const projection = { _id: 0, ID: 1 }
    const query = {group: group};
    return Members.find(query, projection);
}

/**
 * Gibt zu einem Member alle Gruppenmitglieder zurück
 * @param {*} member Member einer Gruppe
 * @param {*}  Alle Gruppenmitglieder
 */
module.exports.getGroupMembersByMember = function (group) {
    const query = {group: group}
    const projection = { _id: 0, __v: 0 }
    return Members.find(query, projection)
}