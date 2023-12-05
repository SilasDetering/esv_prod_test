const express = require('express');
const router = express.Router();
const passport = require('passport');
const validateReportRequests = require('../services/validateReportRequest.service');
const IronReports = require('../models/iron_report.model');
const Members = require('../models/members.model');

/* ======================================== EISEN ======================================== */

// Gibt eine Liste aller Eisenmeldungen zurück
router.get('/getListOfIronReport', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    IronReports.getIronReportList()
        .then((reportList) => {
            return res.json({ success: true, reportList });
        })
        .catch((err) => {
            console.log(err);
            return res.json({ success: false, msg: "Datenbankfehler: " + err});
        })
})

// Gibt eine gefilterte Liste aller Eisenmeldungen zurück
router.post('/getFilteredListOfIronReport', passport.authenticate('jwt', { session: false }), validateReportRequests.getFilteredListOfReportsReq, (req, res, next) => {
    IronReports.getFilteredIronReportList(req.body.ids, req.body.dates)
        .then((reportList) => {
            return res.json({ success: true, reportList });
        })
        .catch((err) => {
            console.log(err);
            return res.json({ success: false, msg: "Datenbankfehler: " + err});
        })
})

// Gibt eine Liste aller Eisenmeldungen eines gewählten Jahres zurück
router.get('/getIronReportsUntilDate/:date', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    IronReports.getIronReportsUntilDate(req.params.date)
        .then((reportList) => {
            return res.json({ success: true, reportList });
        })
        .catch((err) => {
            console.log(err);
            return res.json({ success: false, msg: "Datenbankfehler: " + err});
        })
})

// Gibt eine Liste aller Daten zurück
router.get('/getIronReportDates', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    IronReports.getIronReportDates()
        .then((reportList) => {
            return res.json({ success: true, reportList });
        })
        .catch((err) => {
            console.log(err);
            return res.json({ success: false, msg: "Datenbankfehler: " + err});
        })
})

// Gibt eine Liste aller Eisenmeldungen eines gewählten Jahres zurück
router.get('/getIronReportsByYear/:year', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    IronReports.getIronReportsByYear(req.params.year)
        .then((reportList) => {
            return res.json({ success: true, reportList });
        })
        .catch((err) => {
            console.log(err);
            return res.json({ success: false, msg: "Datenbankfehler: " + err});
        })
})

// Fügt eine neue Eisenmeldung der Datenbank hinzu
router.post('/addIronReport', passport.authenticate('jwt', { session: false }), validateReportRequests.addIronReportReq, (req, res, next) => {
    const newReport = req.data;

    // Prüfen ob bereits ein Bericht von dieser Firma aus dem gewählten Datum vorhanden ist
    IronReports.getIronReport(newReport.companyID, newReport.reportDate)
        .then((report) => {
            if (report) {
                return res.json({ success: false, msg: "Es ist bereits eine Meldung des Mitgliedes aus diesem Monat vorhanden. Bitte löschen sie zuerst die alte Meldung." })
            }
            else {
                // Bericht hinzufügen
                IronReports.addIronReport(newReport)
                    .then(() => {
                        return res.json({ success: true, msg: "Die Meldung wurde hinzugefügt" });
                    })
                    .catch((err) => {
                        console.log(err);
                        return res.json({ success: false, msg: "Datenbankfehler: " + err});
                    })
            }
        })
        .catch((err) => {
            console.log(err);
            return res.json({ success: false, msg: "Datenbankfehler: " + err});
        })
})

// Löscht eine Eisenmeldung aus der Datenbank anhand des Datums und des Unternehmensnamen
router.post('/deleteIronReport', passport.authenticate('jwt', { session: false }), validateReportRequests.deleteReportReq, (req, res, next) => {
    const reportToDelete = req.data;

    IronReports.deleteIronReport(reportToDelete.companyID, reportToDelete.reportDate)
        .then(() => {
            return res.json({ success: true, msg: "Die Meldungen wurde gelöscht" });
        })
        .catch((err) => {
            console.log(err);
            return res.json({ success: false, msg: "Datenbankfehler: " + err});
        })
})

// Gibt eine Liste aller Eisenmeldungen passend zu einem gewählten Monat und Jahr zurück
router.get('/getIronReportByDate/:date', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    var { date } = req.params;

    IronReports.getIronReportsByDate(date)
        .then((reportList) => {
            return res.json({ success: true, reportList });
        })
        .catch((err) => {
            console.log(err);
            return res.json({ success: false, msg: "Datenbankfehler: " + err});
        })
})

/**
 *  Gibt eine Lister aller Eisenmeldungen zu einem gewählten Jahr und der zum Mitglied zugehörigen Gruppe zurück.
 *  Falls das Mitglied in keiner Gruppe ist wird eine Liste aller Meldungen des Mitgliedes aus dem gewählten Jahr zurückgegeben.
 */
router.post('/getGroupReports', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    var member = req.body.member;
    var date = req.body.date;

    if (member.group) {
        Members.getMemberIDsByGroup(member.group)
            .then((memberIDs) => {
                IronReports.getIronReportsByYearAndIDList(date, memberIDs)
                    .then((reportList) => {
                        return res.json({ success: true, reportList });
                    })
                    .catch((err) => {
                        console.log(err);
                        return res.json({ success: false, msg: "Datenbankfehler: " + err});
                    })
            })
            .catch((err) => {
                console.log(err);
                return res.json({ success: false, msg: "Datenbankfehler: " + err});
            })
    } else {
        IronReports.getIronReportsByYearAndID(date, member.ID)
            .then((reportList) => {
                return res.json({ success: true, reportList });
            })
            .catch((err) => {
                console.log(err);
                return res.json({ success: false, msg: "Datenbankfehler: " + err});
            })
    }
});

/* ================================== ESV Importe Markt ================================== */

router.get('/getInnlandShippingStatsForIron', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    IronReports.getIronMarketData()
        .then((data) => {
            return res.json({ success: true, data });
        })
        .catch((err) => {
            console.log(err);
            return res.json({ success: false, msg: "Datenbankfehler: " + err});
        })
})

module.exports = router;