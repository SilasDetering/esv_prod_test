const express = require('express');
const router = express.Router();
const passport = require('passport');
const validateReportRequests = require('../services/validateReportRequest.service');
const SteelReports = require('../models/steel_report.model');
const Members = require('../models/members.model');

/* ======================================== STAHL ======================================== */

// Gibt eine Liste aller Stahlmeldungen zurück
router.get('/getListOfSteelReport', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    SteelReports.getSteelReportList( (err, reportList)=>{
        if(err){
            console.log("Datenbankfehler: " + err);                                                                                                      /* CONSOLE LOG */
            return res.json({ success: false, msg: "Es ist ein Fehler in der Datenbank aufgetreten" });
        } else {
            return res.json({ success: true, reportList});

        }
    })
})

// Gibt eine gefilterte Liste aller Stahlmeldungen zurück
router.post('/getFilteredListOfSteelReport', passport.authenticate('jwt', { session: false }), validateReportRequests.getFilteredListOfReportsReq, (req, res, next) => {
    SteelReports.getFilteredSteelReportList(req.body.ids, req.body.dates, (err, reportList)=>{
        if(err){
            console.log("Datenbankfehler: " + err);                                                                                                      /* CONSOLE LOG */
            return res.json({ success: false, msg: "Es ist ein Fehler in der Datenbank aufgetreten" });
        } else {
            return res.json({ success: true, reportList});

        }
    })
})

// Gibt eine Liste aller Stahlmeldungen eines gewählten Jahres zurück
router.get('/getSteelReportsUntilDate/:date', passport.authenticate('jwt', { session: false }),  (req, res, next) => {
    SteelReports.getSteelReportsUntilDate( req.params.date, (err, reportList)=>{
        if(err){
            console.log("Datenbankfehler: " + err);                                                                                                      /* CONSOLE LOG */
            return res.json({ success: false, msg: "Es ist ein Fehler in der Datenbank aufgetreten" });
        } else {
            return res.json({ success: true, reportList});
        }
    })
})

// Gibt eine Liste aller Daten zurück
router.get('/getSteelReportDates', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    SteelReports.getSteelReportDates( (err, reportList)=>{
        if(err){
            console.log("Datenbankfehler: " + err);                                                                                                      /* CONSOLE LOG */
            return res.json({ success: false, msg: "Es ist ein Fehler in der Datenbank aufgetreten" });
        } else {
            return res.json({ success: true, reportList});
        }
    })
})

// Gibt eine Liste aller Stahlmeldungen eines gewählten Jahres zurück
router.get('/getSteelReportsByYear/:year', passport.authenticate('jwt', { session: false }),  (req, res, next) => {
    SteelReports.getSteelReportsByYear( req.params.year, (err, reportList)=>{
        if(err){
            console.log("Datenbankfehler: " + err);                                                                                                      /* CONSOLE LOG */
            return res.json({ success: false, msg: "Es ist ein Fehler in der Datenbank aufgetreten" });
        } else {
            return res.json({ success: true, reportList});
        }
    })
})

// Fügt eine neue Stahlmeldung der Datenbank hinzu
router.post('/addSteelReport', passport.authenticate('jwt', { session: false }), validateReportRequests.addSteelReportReq, (req, res, next) => {
    const newReport = req.data;

    // Prüfen ob bereits ein Bericht von dieser Firma aus dem gewählten Datum vorhanden ist
    SteelReports.getSteelReport(newReport.companyID, newReport.reportDate, (err, report) => {
        if(err){
            console.log("Datenbankfehler: " + err);                                                                                                      /* CONSOLE LOG */
            return res.json({ success: false, msg: "Es ist ein Fehler in der Datenbank aufgetreten" });
        }else if(report){
            return res.json({ success: false, msg: "Es ist bereits eine Meldung des Mitgliedes aus diesem Monat vorhanden. Bitte löschen sie zuerst die alte Meldung."})
        }else{
            // Bericht hinzufügen
            SteelReports.addSteelReport(newReport, (err) => {
                if(err){
                    console.log("Datenbankfehler: " + err);                                                                                             /* CONSOLE LOG */
                    return res.json({ success: false, msg: "Es ist ein Fehler in der Datenbank aufgetreten" });
                }else{
                    return res.json({ success: true, msg: "Die Meldung wurde hinzugefügt" });
                }
            })
        }
    })
})

// Löscht eine Eisenmeldung aus der Datenbank anhand des Datums und des Unternehmensnamen
router.post('/deleteSteelReport', passport.authenticate('jwt', { session: false }), validateReportRequests.deleteReportReq, (req, res, next) => {
    const reportToDelete = req.data;

    SteelReports.deleteSteelReport(reportToDelete.companyID, reportToDelete.reportDate, (err) => {
        if(err){
            console.log("Datenbankfehler: " + err);                                                                                                      /* CONSOLE LOG */
            return res.json({ success: false, msg: "Es ist ein Fehler in der Datenbank aufgetreten" });
        } else {
            return res.json({ success: true, msg: "Die Meldungen wurde gelöscht" });
        }
    })
})

// Gibt eine Liste aller Stahlmeldungen passend zu einem gewählten Datum zurück
router.get('/getSteelReportByDate/:filter', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    var { filter } = req.params;

    SteelReports.getSteelReportsByDate(filter, (err, reportList)=>{
        if(err) {
            console.log("Datenbankfehler: " + err);                                                                                                      /* CONSOLE LOG */
            return res.json({ success: false, msg: "Es ist ein Fehler in der Datenbank aufgetreten"});
        }else{
            return res.json({ success: true, reportList});
        }
    })
});

/**
 *  Gibt eine Lister aller Stahlmeldungen zu einem gewählten Jahr und der zum Mitglied zugehörigen Gruppe zurück.
 *  Falls das Mitglied in keiner Gruppe ist wird eine Liste aller Meldungen des Mitgliedes aus dem gewählten Jahr zurückgegeben.
 */ 
router.post('/getGroupReports', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    var member = req.body.member;
    var date = req.body.date;

    if(member.group){
        Members.getMemberIDsByGroup(member.group, (err, memberIDs) => {
            if(err){
                console.log("Datenbankfehler: " + err);                                                                                                /* CONSOLE LOG */
                return res.json({ success: false, msg: "Es ist ein Fehler in der Datenbank aufgetreten"});
            }else{
                SteelReports.getSteelReportsByYearAndIDList(date, memberIDs, (err, reportList) => {
                    if(err){
                        console.log("Datenbankfehler: " + err);                                                                                        /* CONSOLE LOG */
                        return res.json({ success: false, msg: "Es ist ein Fehler in der Datenbank aufgetreten"});
                    }else{
                        return res.json({ success: true, reportList});
                    }
                });
            }
        });
    } else {
        SteelReports.getSteelReportsByYearAndID(date, member.ID, (err, reportList) => {
            if(err){
                console.log("Datenbankfehler: " + err);                                                                                                /* CONSOLE LOG */
                return res.json({ success: false, msg: "Es ist ein Fehler in der Datenbank aufgetreten"});
            }else{
                return res.json({ success: true, reportList});
            }
        });
    }
    
});


/* ================================== ESV Importe Markt ================================== */

router.get('/getInnlandShippingStatsForSteel', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    SteelReports.getSteelMarketData( (err, data) => {
        if(err){
            console.log("Datenbankfehler: " + err);                                                                                                      /* CONSOLE LOG */
            return res.json({ success: false, msg: "Es ist ein Fehler in der Datenbank aufgetreten" });
        } else {
            return res.json({ success: true, data });
        }
    })
})

module.exports = router;