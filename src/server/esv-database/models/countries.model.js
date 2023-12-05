/**
 *  Datenbank, die alle Länder speichert nachdem die Importe gefiltert werden sollen
 *  Länder bestehen aus: LänderNr., Name, Kontinent, isEu?, isEFTA?
*/

const mongoose = require('mongoose');

// Schemata
const CountriesShema = mongoose.Schema({
    countryID: { type: String, required: true, unique: true },
    name: { type: String, required: true},
    continent: { type: String, required: true},
    isEU: { type: Boolean, required: true},
    isEFTA: { type: Boolean, required: true},
})

// Mit ESV Datenbank verbinden
const esvDB = mongoose.connection.useDb('esvDB');

// Schema exportieren
const Countries = module.exports = esvDB.model('countries', CountriesShema);

/**
 * Fügt ein neues Land in die Datenbank hinzu.
 * @param newCountry neues Country Objekt { [name], [countryID], [kontinent], [isEu]?, [isEFTA]? }.
 * @returns [err] im Fehlerfall.
 */
module.exports.addCountry = function (newCountry) {
    return Countries.insertMany(newCountry)
}

/**
 * Gibt ein Land anhand der countryID zurück.
 * @param id ID des gesuchten Landes.
 * @returns [err] im Fehlerfall, [country] falls ein zur ID passendes Land gefunden wurde.
 */
module.exports.getCountryById = function (id) {
    const projection = { _id: 0, __v: 0}
    const query = { countryID: id };
    return Countries.findOne(query, projection);
}

/**
 * Sucht ein Land anhand seines Namens in der Datenbank.
 * @param name Name des Landes.
 * @returns [err] im Fehlerfall, [country] falls ein zum Namen passendes Land gefunden wurde.
 */
module.exports.getCountryByName = function (name) {
    const query = { name: name };
    const projection = { _id: 0, __v: 0}
    return Countries.findOne(query, projection);
}

/**
 * Gibt eine Liste aller Länder aus der Datenbank zurück.
 * @param filter Kontinent nach denen die Länder gefiltert werden sollen. 
 *               "all" falls die Länder aller Kontinente zurückgegeben werden sollen.
 * @returns [err] im Fehlerfall, [countryList] Liste aller gespeicherten Länder passend zum gewünschten Kontinent.
 */
module.exports.getCountryList = function (filter) {
    if( filter == "all"){
        filter = {$in:["Europa","Asien","Nordamerika","Südamerika","Ozeanien","Antarktis","Afrika"]};
    }
    const query = { continent: filter }
    const projection = { _id: 0, __v: 0}
    return Countries.find(query, projection,).sort({ name: 1 });
}

/**
 * Gibt alle Länder IDs aus, die in der Datenbank gespeichert werden.
 * @returns [err] im Fehlerfall, [countryIDs] Länder IDs aller gespeicherten Länder.
 */
module.exports.getListOfCountryIDs = function() {
    return Countries.distinct("countryID", {});
}

/**
 * Überschreibt die Daten eines gespeicherten Landes.
 * @param countryID Länder ID anhand dessen das zu überschreibende Land gesucht wird.
 * @param newInformation Neue Länderdaten 
 * @returns [err] im Fehlerfall, [modifiedCount] anzahl der überschriebenen Objekte, [matchedCount] anzahl der zum Benutzernamen passenden Dokumente
 */
module.exports.updateCoutry = function (countryID, newInformation) {
    const query = { countryID: countryID };
    return Countries.updateOne(query, newInformation);
}

/**
 * Löscht ein Land anhand seiner ID aus der Datenbank.
 * @param id ID des zu löschenden Landes.
 * @returns [err] im Fehlerfall, [deletedCountry] gelöschtes Land.
 */
module.exports.deleteCountry = function (id) {
    const query = { countryID: id };
    return Countries.findOneAndDelete(query);
}