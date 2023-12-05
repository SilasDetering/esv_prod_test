const express = require('express');
const router = express.Router();
const passport = require('passport');
const validateReportRequests = require('../services/validateReportRequest.service');
const SteelReports = require('../models/Steel_report.model');
const Members = require('../models/members.model');

/* ======================================== STAHL ======================================== */

// Gibt eine Liste aller Stahlmeldungen zurück
router.get('/getListOfSteelReport', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    SteelReports.getSteelReportList()
        .then((reportList) => {
            return res.json({ success: true, reportList });
        })
        .catch((err) => {
            console.log(err);
            return res.json({ success: false, msg: "Datenbankfehler: " + err});
        })
})

// Gibt eine gefilterte Liste aller Stahlmeldungen zurück
router.post('/getFilteredListOfSteelReport', passport.authenticate('jwt', { session: false }), validateReportRequests.getFilteredListOfReportsReq, (req, res, next) => {
    SteelReports.getFilteredSteelReportList(req.body.ids, req.body.dates)
        .then((reportList) => {
            return res.json({ success: true, reportList });
        })
        .catch((err) => {
            console.log(err);
            return res.json({ success: false, msg: "Datenbankfehler: " + err});
        })
})

// Gibt eine Liste aller Stahlmeldungen eines gewählten Jahres zurück
router.get('/getSteelReportsUntilDate/:date', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    SteelReports.getSteelReportsUntilDate(req.params.date)
        .then((reportList) => {
            return res.json({ success: true, reportList });
        })
        .catch((err) => {
            console.log(err);
            return res.json({ success: false, msg: "Datenbankfehler: " + err});
        })
})

// Gibt eine Liste aller Daten zurück
router.get('/getSteelReportDates', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    SteelReports.getSteelReportDates()
        .then((reportList) => {
            return res.json({ success: true, reportList });
        })
        .catch((err) => {
            console.log(err);
            return res.json({ success: false, msg: "Datenbankfehler: " + err});
        })
})

// Gibt eine Liste aller Stahlmeldungen eines gewählten Jahres zurück
router.get('/getSteelReportsByYear/:year', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    SteelReports.getSteelReportsByYear(req.params.year)
        .then((reportList) => {
            return res.json({ success: true, reportList });
        })
        .catch((err) => {
            console.log(err);
            return res.json({ success: false, msg: "Datenbankfehler: " + err});
        })
})

// Fügt eine neue Stahlmeldung der Datenbank hinzu
router.post('/addSteelReport', passport.authenticate('jwt', { session: false }), validateReportRequests.addSteelReportReq, (req, res, next) => {
    const newReport = req.data;

    // Prüfen ob bereits ein Bericht von dieser Firma aus dem gewählten Datum vorhanden ist
    SteelReports.getSteelReport(newReport.companyID, newReport.reportDate)
        .then((report) => {
            if (report) {
                return res.json({ success: false, msg: "Es ist bereits eine Meldung des Mitgliedes aus diesem Monat vorhanden. Bitte löschen sie zuerst die alte Meldung." })
            }
            else {
                // Bericht hinzufügen
                SteelReports.addSteelReport(newReport)
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

// Löscht eine Stahlmeldung aus der Datenbank anhand des Datums und des Unternehmensnamen
router.post('/deleteSteelReport', passport.authenticate('jwt', { session: false }), validateReportRequests.deleteReportReq, (req, res, next) => {
    const reportToDelete = req.data;

    SteelReports.deleteSteelReport(reportToDelete.companyID, reportToDelete.reportDate)
        .then(() => {
            return res.json({ success: true, msg: "Die Meldungen wurde gelöscht" });
        })
        .catch((err) => {
            console.log(err);
            return res.json({ success: false, msg: "Datenbankfehler: " + err});
        })
})

// Gibt eine Liste aller Stahlmeldungen passend zu einem gewählten Monat und Jahr zurück
router.get('/getSteelReportByDate/:date', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    var { date } = req.params;

    SteelReports.getSteelReportsByDate(date)
        .then((reportList) => {
            return res.json({ success: true, reportList });
        })
        .catch((err) => {
            console.log(err);
            return res.json({ success: false, msg: "Datenbankfehler: " + err});
        })
})

/**
 *  Gibt eine Lister aller Stahlmeldungen zu einem gewählten Jahr und der zum Mitglied zugehörigen Gruppe zurück.
 *  Falls das Mitglied in keiner Gruppe ist wird eine Liste aller Meldungen des Mitgliedes aus dem gewählten Jahr zurückgegeben.
 */
router.post('/getGroupReports', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    var member = req.body.member;
    var date = req.body.date;

    if (member.group) {
        Members.getMemberIDsByGroup(member.group)
            .then((memberIDs) => {
                SteelReports.getSteelReportsByYearAndIDList(date, memberIDs)
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
        SteelReports.getSteelReportsByYearAndID(date, member.ID)
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

router.get('/getInnlandShippingStatsForSteel', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    SteelReports.getSteelMarketData()
        .then((data) => {
            return res.json({ success: true, data });
        })
        .catch((err) => {
            console.log(err);
            return res.json({ success: false, msg: "Datenbankfehler: " + err});
        })
})

module.exports = router;