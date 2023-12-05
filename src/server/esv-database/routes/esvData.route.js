const express = require('express');
const router = express.Router();
const Report = require('../models/import.model');
const MonthReport = require('../models/import_month.model');
const YearStats = require('../models/import_avg.model');
const Country = require('../models/countries.model');
const passport = require('passport');
const { normDate } = require('../services/dateUtils.service');
const { calculateMonthSum, calculateYearStats, calculateMonthAverage, getImportForEachCountry } = require("../services/computeStatistics.service");
const validateReq = require('../services/validateESVRequest.service')

// Speichert neue Import Daten in der Datenbank ab.
router.post('/storeImportData', passport.authenticate('jwt', { session: false }), validateReq.saveDataReq, (req, res, next) => {

    let dataAsObjectSet = req.dataAsObjectSet;
    let dateOfImport = dataAsObjectSet[0].importDate

    // Prüfen ob bereits Daten aus diesem Monat vorhanden.
    Report.existsDataWithImportDate(dateOfImport)
        .then((data) => {
            if (data) {
                return res.json({ success: false, msg: "Es sind bereits Daten aus diesem Monat vorhanden. Bitte löschen Sie diese, um diese mit neuen zu überschreiben" });
            } else {
                // Daten zur Datenbank hinzufügen
                Report.addImportData(dataAsObjectSet)
                    .then(() => {
                        // Monats und Jahres Statistik aktualisieren
                        try {
                            // Monats und Jahres Statistik aktualisieren
                            calculateMonthSum(dateOfImport)
                        } catch (error) {
                            Report.deleteImportDataByImportDate(dateOfImport)
                            console.log(error);
                            return res.json({ success: false, msg: "Berechnungsfehler: " + error });
                        }
                        return res.json({ success: true, msg: "Ein Datensatz aus " + dataAsObjectSet.length + " Einträgen wurde hinzugefügt" });
                    })
                    .catch((err) => {
                        console.log(err);
                        return res.json({ success: false, msg: 'Datenbankfehler: ' + err })
                    })
            }
        })
        .catch((err) => {
            console.log(err);
            return res.json({ success: false, msg: 'Datenbankfehler: ' + err })
        })
});

/**
 * Gibt die Statistik für einen gewählten Monat, oder bei "all" alle Monate, an den Client zurück.
 * @response Objekt aus success, message (msg), und Daten (listOfRep)
 */
router.get('/getMonthlyImportStats/:date', passport.authenticate('jwt', { session: false }), validateReq.getMonthlyImportStatsReq, (req, res, next) => {
    let date = req.params.date

    if (date == "all") {
        MonthReport.getMonthReports()
            .then((listOfRep) => {
                return res.json({ success: true, listOfRep: listOfRep });
            })
            .catch((err) => {
                console.log(err);
                return res.json({ success: false, msg: 'Datenbankfehler: ' + err })
            })
    } else {
        MonthReport.getMonthRepsByYear(normDate(date))
            .then((listOfRep) => {
                return res.json({ success: true, listOfRep: listOfRep });
            })
            .catch((err) => {
                console.log(err);
                return res.json({ success: false, msg: 'Datenbankfehler: ' + err })
            })
    }
});

/**
 * Löscht die Monatsstatistik aus der Datenbank welche zum übergebenen Datum passt
 * @argument date, bekommt ein Datum im Req übermittelt (Format: JJJJ-MM-TT)
 */
router.delete('/deleteMonthImport/:date', passport.authenticate('jwt', { session: false }), validateReq.dateSyntax, (req, res, next) => {
    let date = normDate(req.params.date)

    // Lösche alle Import Daten
    Report.deleteImportDataByImportDate(date)
        .then(() => {
            // Lösche die Monatsstatistik
            MonthReport.deleteMonthRepByImportDate(date)
                .then(() => {
                    // Berechne die Jahresstatistik neu
                    try {
                        calculateYearStats(date)
                        return res.json({ success: true, msg: 'Der Datensatz vom ' + date + ' wurde gelöscht' })
                    } catch (error) {
                        console.log(error)
                        return res.json({ success: false, msg: 'Berechnungsfehler: ' + error });
                    }
                })
                .catch((err) => {
                    console.log(err)
                    return res.json({ success: false, msg: 'Datenbankfehler: ' + err });
                })
        })
        .catch((err) => {
            console.log(err)
            return res.json({ success: false, msg: 'Datenbankfehler: ' + err });
        })
});

/**
 * Gibt den Monatsdurchschnitt aller vorhandenen Jahre zurück
 */
router.get('/getMonthAvgsPerYear', passport.authenticate('jwt', { session: false }), (req, res, next) => {

    YearStats.getAllYearSums()
        .then((data) => {
            avg_data = calculateMonthAverage(data)
            return res.json({ success: true, data: avg_data })
        })
        .catch((err) => {
            console.log(err)
            return res.json({ success: false, msg: 'Datenbankfehler: ' + err });
        })
});

/**
 * Gibt die Summe der Monatsimporte eines Jahres zurück
 */
router.get('/getYearSum/:year', passport.authenticate('jwt', { session: false }), validateReq.getYearSumReq, (req, res, next) => {
    let year = req.params.year

    if (year) {
        // Spezifisches Jahr
        YearStats.getSpecificYearSum(year)
            .then((yearStat) => {
                return res.json({ success: true, data: yearStat[0] })
            })
            .catch((err) => {
                console.log(err)
                return res.json({ success: false, msg: 'Datenbankfehler: ' + err });
            })
    } else {
        // Alle enthaltenen Jahre
        YearStats.getAllYearSums()
            .then((yearStats) => {
                return res.json({ success: true, data: yearStats })
            })
            .catch((err) => {
                console.log(err)
                return res.json({ success: false, msg: 'Datenbankfehler: ' + err });
            })
    }
});

/**
 * Gibt eine List von importDaten zusammen mit den Länderspzifischen Daten zurück
 */
router.get('/getImportsPerCountry/:date', passport.authenticate('jwt', { session: false }), validateReq.dateSyntax, (req, res, next) => {
    let date = normDate(req.params.date)

    Report.findImportDataByImportDate(date)
        .then((importData) => {
            Country.getCountryList("all")
                .then((countries) => {
                    // Merge importData and countryData by originID
                    data = getImportForEachCountry(importData, countries)
                    return res.json({ success: true, data: data })
                })
                .catch((err) => {
                    console.log(err)
                    return res.json({ success: false, msg: 'Datenbankfehler: ' + err });
                })
        })
        .catch((err) => {
            console.log(err)
            return res.json({ success: false, msg: 'Datenbankfehler: ' + err });
        })
});

/**
 * Gibt für ein bestimmtes Jahr die Import-Statistiken pro Land zurück
 */
router.get('/getCountryImportsPerYear/:date', passport.authenticate('jwt', { session: false }), validateReq.dateSyntax, (req, res, next) => {
    let date = normDate(req.params.date)

    Report.getCountryImportsForSpecificYear(date)
        .then((stats) => {
            Country.getCountryList("all")
                .then((countries) => {
                    data = getImportForEachCountry(stats, countries)
                    return res.json({ success: true, data: data })
                })
                .catch((err) => {
                    console.log(err)
                    return res.json({ success: false, msg: 'Datenbankfehler: ' + err });
                })
        })
        .catch((err) => {
            console.log(err)
            return res.json({ success: false, msg: 'Datenbankfehler: ' + err });
        })
});

/**
 * Berechnet die Monatsstatistiken und Jahresstatistiken neu, indem es calculateMonthSum() für jede Monatsstatistik neu durchführt
 */
router.post('/refreshStats', passport.authenticate('jwt', { session: false }), (req, res, next) => {

    Report.getImportStatsDates()
        .then((dates) => {
            dates.forEach(date => {
                try {
                    calculateMonthSum(date)
                } catch (error) {
                    console.log(error)
                    return res.json({ success: false, msg: 'Fehler beim aktualisieren augetreten' });
                }
            })
            return res.json({ success: true, msg: 'Statistiken wurden aktualisiert' })
        })
        .catch((err) => {
            console.log(err)
            return res.json({ success: false, msg: 'Datenbankfehler: ' + err });
        })
});

module.exports = router;