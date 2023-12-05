/**
 *  Datenbank, die alle Mitglieder speichert nachdem die Importe gefiltert werden sollen
 *  Mitglieder bestehen aus: MitgliederID, Mitglieder Name
*/

const mongoose = require('mongoose');

// Schemata
const SteelReportShema = mongoose.Schema({
    companyID: { type: String, required: true },
    reportDate: { type: String, required: true },
    insertDate: { type: Date, default: Date.now },

    seildraht_inland: { type: Number },
    polsterfederdraht_inland: { type: Number },
    federdraht_SH_SL_SM_inland: { type: Number },
    federdraht_DH_DM_inland: { type: Number },
    federdraht_sonstig_inland: { type: Number },
    draehte_sonstige_inland: { type: Number },

    seildraht_export: { type: Number },
    polsterfederdraht_export: { type: Number },
    federdraht_SH_SL_SM_export: { type: Number },
    federdraht_DH_DM_export: { type: Number },
    federdraht_sonstig_export: { type: Number },
    draehte_sonstige_export: { type: Number },

    country_exports: { type: Array },
})

// Mit ESV Datenbank verbinden
const esvDB = mongoose.connection.useDb('esvDB');

// Schema exportieren
const SteelReports = module.exports = esvDB.model('SteelReports', SteelReportShema);

/**
 * Fügt einen neuen Bericht von inland und ausland vertrieben von Eisenprodukten eines Mitgliedes hinzu.
 * @param newSteelReport neuer Bericht, der hinzugefügt werden soll
 * @returns [err] im Fehlerfall.
 */
module.exports.addSteelReport = function (newSteelReport) {
    return SteelReports.insertMany(newSteelReport)
}

/**
 * Gibt einen Bericht anhand der companyID und dem Bericht-Datum zurück.
 * @param id ID des Mitgliedes von dem ein Bericht gesucht wird
 * @param date Datum des Berichtes.
 * @returns [err] im Fehlerfall, [report] falls ein zur companyID und reportDate passender Bericht gefunden wurde.
 */
module.exports.getSteelReport = function (id, date) {
    const projection = { _id: 0, __v: 0 }
    const query = { companyID: id, reportDate: date };
    return SteelReports.findOne(query, projection);
}

/**
 * Gibt eine Liste aller Meldungen der Mitglieder aus der Datenbank zurück.
 * @returns [err] im Fehlerfall, [reportList] Liste von Meldungen der Mitglieder.
 */
module.exports.getSteelReportList = function () {
    const projection = { _id: 0, __v: 0 }
    const query = {};
    return SteelReports.find(query, projection).sort({ reportDate: 1 });
}

/**
 * Gibt eine gefilterte Liste aller Meldungen der Mitglieder aus der Datenbank zurück.
 * @returns [err] im Fehlerfall, [reportList] Liste von Meldungen der Mitglieder.
 */
module.exports.getFilteredSteelReportList = function (ids, dates) {
    const projection = { _id: 0, __v: 0, country_exports: 0 };
    const query = {
        companyID: { $in: ids },
        reportDate: { $in: dates }
    };
    return SteelReports.find(query, projection).sort({ reportDate: 1 });
}

/**
 * Gibt alle Meldungen eines Jahres und des vorherigen Jahres zurück
 * @param date Datum für welches alle Meldungen zurückgegeben werden sollen
 * @returns [err] im Fehlerfall, [list] falls ein zum Namen passendes Mitglied gefunden wurde.
 */
module.exports.getSteelReportsUntilDate = function (date) {
    const year = date.substring(0, 4); // extract year from date string
    const previousYear = parseInt(year) - 1; // calculate the previous year
    
    const query = {
        reportDate: {
            $regex: new RegExp(`^(${previousYear}|${year})`)
        }
    }
    const projection = { _id: 0, __v: 0, country_exports: 0};
    return SteelReports.find(query, projection).sort({ reportDate: 1 });
}

/**
 * Gibt eine Liste aller Daten aus der Datenbank zurück.
 * @returns [err] im Fehlerfall, [dateList] Liste von Daten.
 */
module.exports.getSteelReportDates = function () {
    const projection = { _id: 0, __v: 0 }
    const query = {};
    return SteelReports.find(query, 'reportDate', projection).sort({ reportDate: 1 });
}

/**
 * Gibt alle Meldungen eines Jahres zurück
 * @param date Datum für welches alle Meldungen zurückgegeben werden sollen
 * @returns [err] im Fehlerfall, [list] falls ein zum Namen passendes Mitglied gefunden wurde.
 */
module.exports.getSteelReportsByYear = function (year) { 
    const query = {
        reportDate: {
            $regex: new RegExp(`^(${year})`)
        }
    }
    const projection = { _id: 0, __v: 0};
    return SteelReports.find(query, projection).sort({ reportDate: 1 });
}

/**
 * Löscht eine Meldung anhand ihrer ID aus der Datenbank.
 * @param id ID der zu löschenden Meldung.
 * @returns [err] im Fehlerfall, [deletedMember] gelöschte Meldung.
 */
module.exports.deleteSteelReport = function (id, date) {
    const filter = { companyID: id, reportDate: date }
    return SteelReports.findOneAndDelete(filter);
}

/**
 * Gibt alle Meldungen eines bestimmten Datums zurück
 * @param date Datum für welches alle Meldungen zurückgegeben werden sollen
 * @returns  [err] im Fehlerfall, [list] Liste aller zum Datum passenden Meldungen.
 */
module.exports.getSteelReportsByDate = function (date) {
    const query = { reportDate: date };
    const projection = { _id: 0, __v: 0};
    return SteelReports.find(query, projection);
}

/**
 * Gibt alle nötigen Daten für die Stahlmarktübersicht zurück
 * @returns 
 */
module.exports.getSteelMarketData = function () {
    const query = {};
    const projection = {
        _id: 0,
        reportDate: 1,
        steel_inland: {
            $add: [
                "$seildraht_inland",
                "$polsterfederdraht_inland",
                "$federdraht_SH_SL_SM_inland",
                "$federdraht_DH_DM_inland",
                "$federdraht_sonstig_inland",
                "$draehte_sonstige_inland",
            ],
        },
    };

    return SteelReports.aggregate([
        { $match: query },
        { $project: projection },
        { $sort: { reportDate: 1 } }
    ]);
};

/**
 * Gibt eine Liste von Meldungen zurück, die zu einem bestimmten Jahr und zu bestimmten IDs gehören
 * @param date Datum für welches alle Meldungen zurückgegeben werden sollen
 * @param ids Liste von Member IDs
 * @returns Liste von Meldungen
 */
module.exports.getSteelReportsByYearAndIDList = function (date, ids) {
    const year = date.substring(0, 4);
    
    // Extracting the "ID" values from the objects in the `ids` array
    const companyIDs = ids.map(item => item.ID);

    const query = {
        reportDate: {
            $regex: new RegExp(`^(${year})`)
        },
        companyID: {
            $in: companyIDs
        }
    };
    const projection = { _id: 0, __v: 0 };
    return SteelReports.find(query, projection);
};

/**
 * Gibt eine Liste von Meldungen zurück, die zu einem bestimmten Jahr und zu einer bestimmten ID gehören
 * @param date Datum aus welchem das Jahr extrahiert wird (JJJJ-MM-TT)
 * @param id ID des Mitgliedes für welches die Meldungen zurückgegeben werden sollen
 * @returns Liste von Meldungen
 */
module.exports.getSteelReportsByYearAndID = function (date, id) {
    const year = date.substring(0, 4); 
    const query = {
        reportDate: {
            $regex: new RegExp(`^(${year})`)
        },
        companyID: id
    }
    const projection = { _id: 0, __v: 0};
    return SteelReports.find(query, projection);
};