/**
 * Enthält die Gesammtsumme aller Produkte und Monate eines Jahres in Tonnen sortiert nach Produkt Typ.
 * Stellt die Daten für die Ansicht: "Schnellbericht (Monat), Schnellbericht(Jahr), Markt" zur Berechnung des Durschnitts bereit.
 * Daten stammen aus Urdatensatz "report"
*/

const mongoose = require('mongoose');

// Schema
const YearStatsSchema = mongoose.Schema({
    numberOfMonths: { type: Number, required: true },
    importYear: { type: String, required: true },
    eisendraht_blank_sum: { type: Number, required: true },
    eisendraht_verzinkt_sum: { type: Number, required: true },
    eisendraht_sonstiger_sum: { type: Number, required: true },
    eisendraht_kunststoffummantelt_sum: { type: Number, required: true },
    stahldraht_weniger_blank_sum: { type: Number, required: true },
    stahldraht_weniger_verzinkt_sum: { type: Number, required: true },
    stahldraht_weniger_sonstiger_sum: { type: Number, required: true },
    stahldraht_mehr_blank_sum: { type: Number, required: true },
    stahldraht_mehr_verzinkt_sum: { type: Number, required: true },
    stahldraht_mehr_sonstiger_sum: { type: Number, required: true },
})

// Mit ESV Datenbank verbinden
const esvDB = mongoose.connection.useDb('esvDB'); 

// Schema exportieren
const YearStats = module.exports = esvDB.model('Year_Statistiks', YearStatsSchema);

/**
 * Fügt eine neue Jahresstatistik in die Datenbank hinzu
 * @param data Datensatz der neuen Jahresstatistik
 * @param callback [err] im Fehlerfall
 */
module.exports.addYearStat = function (data, callback) {
    const projection = { _id: 0, __v: 0}
    YearStats.insertMany(data, projection, callback)
}

/**
 * Löscht eine Jahresstatistik aus der Datenbank
 * @param year Das Jahr der zu löschenden Statistik
 * @param callback [err] im Fehlerfall, [deletedCount] Anzahl der gelöschten Dokumente
 */
module.exports.removeYearStat = function (year, callback) {
    const query = { importYear: year }
    const projection = { _id: 0, __v: 0}
    YearStats.deleteMany(query, projection, callback)
}

/**
 * Gibt eine Liste aller gepeicherten Jahressummen aus
 * @param callback [err] im Fehlerfall, [yearStats] Liste aller gespeicherten Jahressummen
 */
module.exports.getAllYearSums = function (callback) {
    const projection = { _id: 0, __v: 0}
    YearStats.find({}, projection, callback).sort({importYear: -1});
}

/**
 * Gibt eine bestimmte Jahressumme anhand des Jahres zurück.
 * @param {*} year Das gewünschte Jahr.
 * @param {*} callback [err] im Fehlerfall, [yearStat] zum übergebenen Jahr passende Jahressumme
 */
module.exports.getSpecificYearSum = function (year, callback) {
    const query = {importYear: year}
    const projection = { _id: 0, __v: 0}
    YearStats.find(query, projection, callback).sort({importYear: -1});
}