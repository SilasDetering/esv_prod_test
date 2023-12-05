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
    Report.existsDataWithImportDate(dateOfImport, (err, data) => {
        if (err) {
            console.log("Datenbankfehler: " + err);                                                                                                                                /* CONSOLE LOG */
            return res.json({ success: false, msg: "Datenbankfehler" });
        }
        if (data) {
            return res.json({ success: false, msg: "Es sind bereits Daten aus diesem Monat vorhanden. Bitte löschen Sie diese, um diese mit neuen zu überschreiben" });
        } else {

            // Daten zur Datenbank hinzufügen
            Report.addImportData(dataAsObjectSet, (err) => {
                if (err) {
                    console.log("Datenbankfehler: " + err);                                                                                                                        /* CONSOLE LOG */
                    return res.json({ success: false, msg: "Datenbankfehler" });
                } else {
                    try {
                        // Monats und Jahres Statistik aktualisieren
                        calculateMonthSum(dateOfImport)
                    } catch (error) {
                        Report.deleteImportDataByImportDate(dateOfImport)
                        console.log(error);                                                                                                                 /* CONSOLE LOG */
                        return res.json({ success: false, msg: "Fehler beim Eintragenn des Datensatzes. Die Jahres oder Monatsstatistik konnte nicht berechnet werden" });
                    }
                    return res.json({ success: true, msg: "Ein Datensatz aus " + dataAsObjectSet.length + " Einträgen wurde hinzugefügt" });
                }
            });
        }
    })
});

/**
 * Gibt die Statistik für einen gewählten Monat, oder bei "all" alle Monate, an den Client zurück.
 * @response Objekt aus success, message (msg), und Daten (listOfRep)
 */
router.get('/getMonthlyImportStats/:date', passport.authenticate('jwt', { session: false }), validateReq.getMonthlyImportStatsReq, (req, res, next) => {
    let date = req.params.date

    if (date == "all") {
        MonthReport.getMonthReports((err, listOfRep) => {
            if (err) {
                console.log("Datenbankfehler: " + err);                                                                                                                            /* CONSOLE LOG */
                return res.json({ success: false, msg: 'Datenbankfehler' });
            }
            return res.json({ success: true, listOfRep: listOfRep });
        });
    } else {
        MonthReport.getMonthRepsByYear(normDate(date), (err, listOfRep) => {
            if (err) {
                console.log("Datenbankfehler: " + err);                                                                                                                             /* CONSOLE LOG */
                return res.json({ success: false, msg: 'Datenbankfehler' });
            }
            return res.json({ success: true, listOfRep: listOfRep });
        });
    }
});

/**
 * Löscht die Monatsstatistik aus der Datenbank welche zum übergebenen Datum passt
 * @argument date, bekommt ein Datum im Req übermittelt (Format: JJJJ-MM-TT)
 */
router.delete('/deleteMonthImport/:date', passport.authenticate('jwt', { session: false }), validateReq.dateSyntax, (req, res, next) => {
    let date = normDate(req.params.date)

    // Lösche alle Import Daten 
    Report.deleteImportDataByImportDate(date, (err) => {
        if (err) {
            console.log(err)                                                                                                                           /* CONSOLE LOG */
            return res.json({ success: false, msg: 'Datenbankfehler' });
        }
    })
    // Lösche die Monatsstatistik
    MonthReport.deleteMonthRepByImportDate(date, (err) => {
        if (err) {
            console.log(err)                                                                                                                           /* CONSOLE LOG */
            return res.json({ success: false, msg: 'Datenbankfehler' });
        }
    })
    // Berechne die Jahresstatistik neu
    calculateYearStats(date)

    return res.json({ success: true, msg: 'Der Datensatz vom ' + date + ' wurde gelöscht' })
});

/**
 * Gibt den Monatsdurchschnitt aller vorhandenen Jahre zurück
 */
router.get('/getMonthAvgsPerYear', passport.authenticate('jwt', { session: false }), (req, res, next) => {

    YearStats.getAllYearSums((err, data) => {
        if (err) {
            console.log(err)                                                                                                                           /* CONSOLE LOG */
            return res.json({ success: false, msg: 'Datenbankfehler' });
        }

        avg_data = calculateMonthAverage(data)
        return res.json({ success: true, data: avg_data })
    })
})

/**
 * Gibt die Summe der Monatsimporte eines Jahres zurück
 */
router.get('/getYearSum/:year', passport.authenticate('jwt', { session: false }), validateReq.getYearSumReq, (req, res, next) => {
    let year = req.params.year

    if (year) {
        // Spezifisches Jahr
        YearStats.getSpecificYearSum(year, (err, yearStat) => {
            if (err) {
                console.log(err)                                                                                                                       /* CONSOLE LOG */
                return res.json({ success: false, msg: 'Datenbankfehler' });
            }
            return res.json({ success: true, data: yearStat[0] })
        })
    } else {
        // Alle enthaltenen Jahre
        YearStats.getAllYearSums((err, yearStats) => {
            if (err) {
                console.log(err)                                                                                                                       /* CONSOLE LOG */
                return res.json({ success: false, msg: 'Datenbankfehler' });
            }
            return res.json({ success: true, data: yearStats })
        })
    }
})

/**
 * Gibt eine List von importDaten zusammen mit den Länderspzifischen Daten zurück
 */
router.get('/getImportsPerCountry/:date', passport.authenticate('jwt', { session: false }), validateReq.dateSyntax, (req, res, next) => {
    let date = normDate(req.params.date)

    Report.findImportDataByImportDate(date, (err, importData) => {
        if (err) {
            console.log(err)                                                                                                                           /* CONSOLE LOG */
            return res.json({ success: false, msg: 'Datenbankfehler' });
        }

        Country.getCountryList("all", (err, countries) => {
            if (err) {
                console.log(err)                                                                                                                       /* CONSOLE LOG */
                return res.json({ success: false, msg: 'Datenbankfehler' });
            }

            // Merge importData and countryData by originID
            data = getImportForEachCountry(importData, countries)

            return res.json({ success: true, data: data })
        })
    })
})

/**
 * Gibt für ein bestimmtes Jahr die Import-Statistiken pro Land zurück
 */
router.get('/getCountryImportsPerYear/:date', passport.authenticate('jwt', { session: false }), validateReq.dateSyntax, (req, res, next) => {
    let date = normDate(req.params.date)

    Report.getCountryImportsForSpecificYear(date, (err, stats) => {
        if (err) {
            console.log(err)                                                                                                                       /* CONSOLE LOG */
            return res.json({ success: false, msg: 'Datenbankfehler' });
        }
        if (!stats) {
            return res.json({ success: false, msg: 'Es sind keine Einträge für dieses Jahr vorhanden' });
        }

        Country.getCountryList("all", (err, countries) => {
            if (err) {
                console.log(err)                                                                                                                   /* CONSOLE LOG */
                return res.json({ success: false, msg: 'Datenbankfehler' });
            }
            data = getImportForEachCountry(stats, countries)

            return res.json({ success: true, data: data })
        })

    })
})

/**
 * Berechnet die Monatsstatistiken und Jahresstatistiken neu, indem es calculateMonthSum() für jede Monatsstatistik neu durchführt
 */
router.post('/refreshStats', passport.authenticate('jwt', { session: false }), (req, res, next) => {

    Report.getImportStatsDates((err, dates) => {
        if (err) {
            console.log(err)                                                                                                                           // CONSOLE LOG
            return res.json({ success: false, msg: 'Datenbankfehler' });
        }
        if (dates) {
            dates.forEach(date => {
                try {
                    calculateMonthSum(date)
                } catch (error) {
                    console.log(error)                                                                                                                 // CONSOLE LOG
                    return res.json({ success: false, msg: 'Fehler beim aktualisieren augetreten' });
                }
            })
        }
    })
    return res.json({ success: true })
});

module.exports = router;