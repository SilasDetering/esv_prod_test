const express = require('express');
const router = express.Router();
const passport = require('passport');
const validateReportRequests = require('../services/validateReportRequest.service');
const IronReports = require('../models/iron_report.model');
const Members = require('../models/members.model');

/* ======================================== EISEN ======================================== */

// Gibt eine Liste aller Eisenmeldungen zurück
router.get('/getListOfIronReport', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    IronReports.getIronReportList( (err, reportList)=>{
        if(err){
            console.log("Datenbankfehler: " + err);                                                                                                      /* CONSOLE LOG */
            return res.json({ success: false, msg: "Es ist ein Fehler in der Datenbank aufgetreten" });
        } else {
            return res.json({ success: true, reportList});

        }
    })
})

// Gibt eine gefilterte Liste aller Eisenmeldungen zurück
router.post('/getFilteredListOfIronReport', passport.authenticate('jwt', { session: false }), validateReportRequests.getFilteredListOfReportsReq, (req, res, next) => {
    IronReports.getFilteredIronReportList(req.body.ids, req.body.dates, (err, reportList)=>{
        if(err){
            console.log("Datenbankfehler: " + err);                                                                                                      /* CONSOLE LOG */
            return res.json({ success: false, msg: "Es ist ein Fehler in der Datenbank aufgetreten" });
        } else {
            return res.json({ success: true, reportList});

        }
    })
})

// Gibt eine Liste aller Eisenmeldungen eines gewählten Jahres zurück
router.get('/getIronReportsUntilDate/:date', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    IronReports.getIronReportsUntilDate( req.params.date, (err, reportList)=>{
        if(err){
            console.log("Datenbankfehler: " + err);                                                                                                      /* CONSOLE LOG */
            return res.json({ success: false, msg: "Es ist ein Fehler in der Datenbank aufgetreten" });
        } else {
            return res.json({ success: true, reportList});
        }
    })
})

// Gibt eine Liste aller Daten zurück
router.get('/getIronReportDates', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    IronReports.getIronReportDates( (err, reportList)=>{
        if(err){
            console.log("Datenbankfehler: " + err);                                                                                                      /* CONSOLE LOG */
            return res.json({ success: false, msg: "Es ist ein Fehler in der Datenbank aufgetreten" });
        } else {
            return res.json({ success: true, reportList});
        }
    })
})

// Gibt eine Liste aller Eisenmeldungen eines gewählten Jahres zurück
router.get('/getIronReportsByYear/:year', passport.authenticate('jwt', { session: false }),  (req, res, next) => {
    IronReports.getIronReportsByYear( req.params.year, (err, reportList)=>{
        if(err){
            console.log("Datenbankfehler: " + err);                                                                                                      /* CONSOLE LOG */
            return res.json({ success: false, msg: "Es ist ein Fehler in der Datenbank aufgetreten" });
        } else {
            return res.json({ success: true, reportList});
        }
    })
})

// Fügt eine neue Eisenmeldung der Datenbank hinzu
router.post('/addIronReport', passport.authenticate('jwt', { session: false }), validateReportRequests.addIronReportReq, (req, res, next) => {
    const newReport = req.data;

    // Prüfen ob bereits ein Bericht von dieser Firma aus dem gewählten Datum vorhanden ist
    IronReports.getIronReport(newReport.companyID, newReport.reportDate, (err, report) => {
        if(err){
            console.log("Datenbankfehler: " + err);                                                                                                      /* CONSOLE LOG */
            return res.json({ success: false, msg: "Es ist ein Fehler in der Datenbank aufgetreten" });
        }else if(report){
            return res.json({ success: false, msg: "Es ist bereits eine Meldung des Mitgliedes aus diesem Monat vorhanden. Bitte löschen sie zuerst die alte Meldung."})
        }else{
            // Bericht hinzufügen
            IronReports.addIronReport(newReport, (err) => {
                if(err){
                    console.log("Datenbankfehler: " + err);                                                                                              /* CONSOLE LOG */
                    return res.json({ success: false, msg: "Es ist ein Fehler in der Datenbank aufgetreten" });
                }else{
                    return res.json({ success: true, msg: "Die Meldung wurde hinzugefügt" });
                }
            })
        }
    })
})

// Löscht eine Eisenmeldung aus der Datenbank anhand des Datums und des Unternehmensnamen
router.post('/deleteIronReport', passport.authenticate('jwt', { session: false }), validateReportRequests.deleteReportReq, (req, res, next) => {
    const reportToDelete = req.data;

    IronReports.deleteIronReport(reportToDelete.companyID, reportToDelete.reportDate, (err) => {
        if(err){
            console.log("Datenbankfehler: " + err);                                                                                                      /* CONSOLE LOG */
            return res.json({ success: false, msg: "Es ist ein Fehler in der Datenbank aufgetreten" });
        } else {
            return res.json({ success: true, msg: "Die Meldungen wurde gelöscht" });
        }
    })
})

// Gibt eine Liste aller Eisenmeldungen passend zu einem gewählten Monat und Jahr zurück
router.get('/getIronReportByDate/:date', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    var { date } = req.params;

    IronReports.getIronReportsByDate(date, (err, reportList)=>{
        if(err) {
            console.log("Datenbankfehler: " + err);                                                                                                      /* CONSOLE LOG */
            return res.json({ success: false, msg: "Es ist ein Fehler in der Datenbank aufgetreten"});
        }else{
            return res.json({ success: true, reportList});
        }
    })
});

/**
 *  Gibt eine Lister aller Eisenmeldungen zu einem gewählten Jahr und der zum Mitglied zugehörigen Gruppe zurück.
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
                IronReports.getIronReportsByYearAndIDList(date, memberIDs, (err, reportList) => {
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
        IronReports.getIronReportsByYearAndID(date, member.ID, (err, reportList) => {
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

router.get('/getInnlandShippingStatsForIron', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    IronReports.getIronMarketData( (err, data) => {
        if(err){
            console.log("Datenbankfehler: " + err);                                                                                                      /* CONSOLE LOG */
            return res.json({ success: false, msg: "Es ist ein Fehler in der Datenbank aufgetreten" });
        } else {
            return res.json({ success: true, data });
        }
    })
})

module.exports = router;