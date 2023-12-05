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
 * @returns [err] im Fehlerfall
 */
module.exports.addYearStat = function (data) {
    const projection = { _id: 0, __v: 0}
    return YearStats.insertMany(data, projection)
}

/**
 * Löscht eine Jahresstatistik aus der Datenbank
 * @param year Das Jahr der zu löschenden Statistik
 * @returns [err] im Fehlerfall, [deletedCount] Anzahl der gelöschten Dokumente
 */
module.exports.removeYearStat = function (year) {
    const query = { importYear: year }
    const projection = { _id: 0, __v: 0}
    return YearStats.deleteMany(query, projection)
}

/**
 * Gibt eine Liste aller gepeicherten Jahressummen aus
 * @returns [err] im Fehlerfall, [yearStats] Liste aller gespeicherten Jahressummen
 */
module.exports.getAllYearSums = function () {
    const projection = { _id: 0, __v: 0}
    return YearStats.find({}, projection).sort({importYear: -1});
}

/**
 * Gibt eine bestimmte Jahressumme anhand des Jahres zurück.
 * @param year Das gewünschte Jahr.
 * @returns [err] im Fehlerfall, [yearStat] zum übergebenen Jahr passende Jahressumme
 */
module.exports.getSpecificYearSum = function (year) {
    const query = {importYear: year}
    const projection = { _id: 0, __v: 0}
    return YearStats.find(query, projection).sort({importYear: -1});
}