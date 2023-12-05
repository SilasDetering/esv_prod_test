/**
 * Enthält die Gesammtmasse aller Produkte eines Monats in Tonnen sortiert nach ProduktID.
 * Stellt die Daten für die Ansicht: "Schnellbericht (Monat), Schnellbericht (Jahr), Markt" bereit.
 * Daten stammen aus Urdatensatz "import" 
*/

const mongoose = require('mongoose');

// Schema
const MonthStatsShema = mongoose.Schema({
    insertDate: { type: String, required: true },
    importDate: { type: String, required: true },
    eisendraht_blank: { type: Number, required: true },
    eisendraht_verzinkt: { type: Number, required: true },
    eisendraht_sonstiger: { type: Number, required: true },
    eisendraht_kunststoffummantelt: { type: Number, required: true },
    stahldraht_weniger_blank: { type: Number, required: true },
    stahldraht_weniger_verzinkt: { type: Number, required: true },
    stahldraht_weniger_sonstiger: { type: Number, required: true },
    stahldraht_mehr_blank: { type: Number, required: true },
    stahldraht_mehr_verzinkt: { type: Number, required: true },
    stahldraht_mehr_sonstiger: { type: Number, required: true },
})

// Mit ESV Datenbank verbinden
const esvDB = mongoose.connection.useDb('esvDB');

// Schema exportieren
const MonthStats = module.exports = esvDB.model('Month_Statistiks', MonthStatsShema);

// Neuen Monatsbericht hinzufügen
module.exports.addMonthReport = function (data) {
    return MonthStats.insertMany(data)
}

/**
 * Gibt alle eingetragenen Monatsberichte zurück.
 */
module.exports.getMonthReports = function () {
    const projection = { _id: 0, __v: 0 }
    return MonthStats.find({}, projection).sort({ importDate: -1 });
}

/**
 * Gibt alle Monatsberichte für ein bestimmtes Jahr zurück
 * @param date Datum für das der Monatsbericht zurückgegeben werden soll (JJJJ-MM-TT) 
 */
module.exports.getMonthRepsByYear = function (date) {
    const year = date.substring(0, 4); // extract year from date string
    const query = {
        importDate: {
            $regex: new RegExp(`^${year}`)
        }
    }
    const projection = { _id: 0, __v: 0 }
    return MonthStats.find(query, projection).sort({ importDate: 1 });
}

/**
 * Löscht eine Statistik-Meldung anhand des Datums andem diese Meldung vom Benutzer hinzugefügt wurde
 * @param date Einfüge-Datum anhand dessen die Meldung gelöscht werden soll
*/
module.exports.deleteMonthRepByImportDate = function (date) {
    const query = { importDate: date }
    const projection = { _id: 0, __v: 0 }
    return MonthStats.deleteMany(query, projection)
}
