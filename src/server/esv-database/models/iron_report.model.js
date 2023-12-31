/**
 *  Datenbank, die alle Mitglieder speichert nachdem die Importe gefiltert werden sollen
 *  Mitglieder bestehen aus: MitgliederID, Mitglieder Name
*/

const mongoose = require('mongoose');

// Schemata
const IronReportShema = mongoose.Schema({
    companyID: { type: String, required: true },
    reportDate: { type: String, required: true },
    insertDate: { type: Date, default: Date.now },

    blumendraht_inland: { type: Number },
    flachdraht_inland: { type: Number },
    kettendraht_inland: { type: Number },
    npStahldraehte_inland: { type: Number },
    nietendraht_inland: { type: Number },
    schraubendraht_inland: { type: Number },
    ed_blank_verkupfert_inland: { type: Number },
    ed_geglueht_inland: { type: Number },
    ed_verzinkt_bis_6_inland: { type: Number },
    ed_verzinkt_ueber_6_inland: { type: Number },
    ed_verzinnt_inland: { type: Number },
    ed_kuststoffummantelt_inland: { type: Number },
    stangendraht_inland: { type: Number },
    sonstige_inland: { type: Number },

    blumendraht_export: { type: Number },
    flachdraht_export: { type: Number },
    kettendraht_export: { type: Number },
    npStahldraehte_export: { type: Number },
    nietendraht_export: { type: Number },
    schraubendraht_export: { type: Number },
    ed_blank_verkupfert_export: { type: Number },
    ed_geglueht_export: { type: Number },
    ed_verzinkt_bis_6_export: { type: Number },
    ed_verzinkt_ueber_6_export: { type: Number },
    ed_verzinnt_export: { type: Number },
    ed_kuststoffummantelt_export: { type: Number },
    stangendraht_export: { type: Number },
    sonstige_export: { type: Number },

    country_exports: { type: Array },
})

// Mit ESV Datenbank verbinden
const esvDB = mongoose.connection.useDb('esvDB');

// Schema exportieren
const IronReports = module.exports = esvDB.model('IronReports', IronReportShema);

/**
 * Fügt einen neuen Bericht von inland und ausland vertrieben von Eisenprodukten eines Mitgliedes hinzu.
 * @param newIronReport neuer Bericht, der hinzugefügt werden soll
 * @returns [err] im Fehlerfall.
 */
module.exports.addIronReport = function (newIronReport) {
    return IronReports.insertMany(newIronReport)
}

/**
 * Gibt einen Bericht anhand der companyID und dem Bericht-Datum zurück.
 * @param id ID des Mitgliedes von dem ein Bericht gesucht wird
 * @param date Datum des Berichtes.
 * @returns [err] im Fehlerfall, [report] falls ein zur companyID und reportDate passender Bericht gefunden wurde.
 */
module.exports.getIronReport = function (id, date) {
    const projection = { _id: 0, __v: 0 }
    const query = { companyID: id, reportDate: date };
    return IronReports.findOne(query, projection);
}

/**
 * Gibt eine Liste aller Meldungen der Mitglieder aus der Datenbank zurück.
 * @returns [err] im Fehlerfall, [reportList] Liste von Meldungen der Mitglieder.
 */
module.exports.getIronReportList = function () {
    const projection = { _id: 0, __v: 0 }
    const query = {};
    return IronReports.find(query, projection).sort({ reportDate: 1 });
}

/**
 * Gibt eine gefilterte Liste aller Meldungen der Mitglieder aus der Datenbank zurück.
 * @returns [err] im Fehlerfall, [reportList] Liste von Meldungen der Mitglieder.
 */
module.exports.getFilteredIronReportList = function (ids, dates) {
    const projection = { _id: 0, __v: 0, country_exports: 0 };
    const query = {
        companyID: { $in: ids },
        reportDate: { $in: dates }
    };
    return IronReports.find(query, projection).sort({ reportDate: 1 });
}

/**
 * Gibt alle Meldungen eines Jahres und des vorherigen Jahres zurück
 * @param date Datum für welches alle Meldungen zurückgegeben werden sollen
 * @returns [err] im Fehlerfall, [list] falls ein zum Namen passendes Mitglied gefunden wurde.
 */
module.exports.getIronReportsUntilDate = function (date) {
    const year = date.substring(0, 4); // extract year from date string
    const previousYear = parseInt(year) - 1; // calculate the previous year
    
    const query = {
        reportDate: {
            $regex: new RegExp(`^(${previousYear}|${year})`)
        }
    }
    const projection = { _id: 0, __v: 0, country_exports: 0};
    return IronReports.find(query, projection).sort({ reportDate: 1 });
}

/**
 * Gibt eine Liste aller Daten aus der Datenbank zurück.
 * @returns [err] im Fehlerfall, [dateList] Liste von Daten.
 */
module.exports.getIronReportDates = function () {
    const projection = { _id: 0, __v: 0 }
    const query = {};
    return IronReports.find(query, 'reportDate', projection).sort({ reportDate: 1 });
}

/**
 * Gibt alle Meldungen eines Jahres zurück
 * @param date Datum für welches alle Meldungen zurückgegeben werden sollen
 * @returns [err] im Fehlerfall, [list] falls ein zum Namen passendes Mitglied gefunden wurde.
 */
module.exports.getIronReportsByYear = function (year) { 
    const query = {
        reportDate: {
            $regex: new RegExp(`^(${year})`)
        }
    }
    const projection = { _id: 0, __v: 0};
    return IronReports.find(query, projection).sort({ reportDate: 1 });
}

/**
 * Löscht eine Meldung anhand ihrer ID aus der Datenbank.
 * @param id ID der zu löschenden Meldung.
 * @returns [err] im Fehlerfall, [deletedMember] gelöschte Meldung.
 */
module.exports.deleteIronReport = function (id, date) {
    const filter = { companyID: id, reportDate: date }
    return IronReports.findOneAndDelete(filter);
}

/**
 * Gibt alle Meldungen eines bestimmten Monats zurück
 * @param date Datum für welches alle Meldungen zurückgegeben werden sollen
 * @returns  [err] im Fehlerfall, [list] Liste aller zum Datum passenden Meldungen.
 */
module.exports.getIronReportsByDate = function (date) {
    const query = { reportDate: date };
    const projection = { _id: 0, __v: 0};
    return IronReports.find(query, projection);
}

/**
 * Gibt alle nötigen Daten für die Eisenmarktübersicht zurück
 */
module.exports.getIronMarketData = function () {
    const query = {};
    const projection = {
        _id: 0,
        reportDate: 1,
        ed_verzinkt: {
            $add: [
                "$ed_verzinkt_bis_6_inland",
                "$ed_verzinkt_ueber_6_inland",
            ],
        },
        ed_sonstig: {
            $add: [
                "$blumendraht_inland",
                "$flachdraht_inland",
                "$kettendraht_inland",
                "$npStahldraehte_inland",
                "$nietendraht_inland",
                "$schraubendraht_inland",
                "$ed_blank_verkupfert_inland",
                "$ed_geglueht_inland",
                "$ed_verzinnt_inland",
                "$ed_kuststoffummantelt_inland",
                "$stangendraht_inland",
                "$sonstige_inland",
            ],
        },
    };
    return IronReports.aggregate([
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
module.exports.getIronReportsByYearAndIDList = function (date, ids) {
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
    return IronReports.find(query, projection);
};

/**
 * Gibt eine Liste von Meldungen zurück, die zu einem bestimmten Jahr und zu einer bestimmten ID gehören
 * @param date Datum aus welchem das Jahr extrahiert wird (JJJJ-MM-TT)
 * @param id ID des Mitgliedes für welches die Meldungen zurückgegeben werden sollen
 * @returns Liste von Meldungen
 */
module.exports.getIronReportsByYearAndID = function (date, id) {
    const year = date.substring(0, 4); 
    const query = {
        reportDate: {
            $regex: new RegExp(`^(${year})`)
        },
        companyID: id
    }
    const projection = { _id: 0, __v: 0};
    return IronReports.find(query, projection);
};