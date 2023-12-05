const express = require('express');
const router = express.Router();
const Country = require('../models/countries.model');
const passport = require('passport');
const validateReq = require('../services/validateESVRequest.service')

// Gibt eine Liste aller Länder zurück gefiltert nach Kontinent
router.get('/getCountryList/:filter', passport.authenticate('jwt', { session: false }), validateReq.getCountryListReq, (req, res, next) => {
    var { filter } = req.params;

    Country.getCountryList(filter)
        .then((countries) => {
            return res.json({ success: true, countryList: countries });
        })
        .catch((err) => {
            console.log(err);
            return res.json({ success: false, msg: 'Datenbankfehler: \n' + err })
        })
});

// Fügt ein neues Land in die Liste ein
router.post('/addCountry', passport.authenticate('jwt', { session: false }), validateReq.addCountryReq, (req, res, next) => {
    const newCountry = {
        countryID: req.body.countryID,
        name: req.body.name,
        continent: req.body.continent,
        isEU: req.body.isEU,
        isEFTA: req.body.isEFTA
    }

    // Prüfen ob ein Land mit dem selben Namen schon vorhanden ist
    Country.getCountryByName(newCountry.name)
        .then((country) => {
            if (country) {
                return res.json({ success: false, msg: 'Das Land mit dem Namen ' + newCountry.name + ' ist bereits vorhanden' });
            } else {
                // Prüfen ob ein Land mit der selben countryID schon vorhanden ist
                Country.getCountryById(newCountry.countryID)
                    .then((country) => {
                        if (country) {
                            return res.json({ success: false, msg: 'Das Land mit der ID ' + newCountry.countryID + ' ist bereits vorhanden' });
                        } else {
                            // Land hinzufügen
                            Country.addCountry(newCountry)
                                .then(() => {
                                    return res.json({ success: true, msg: 'Das Land wurde hinzugefügt' });
                                })
                                .catch((err) => {
                                    console.log(err);
                                    return res.json({ success: false, msg: 'Datenbankfehler: \n' + err })
                                })
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        return res.json({ success: false, msg: 'Datenbankfehler: \n' + err })
                    })
            }
        })
        .catch((err) => {
            console.log(err);
            return res.json({ success: false, msg: 'Datenbankfehler: \n' + err })
        })
});

// Löscht ein Land anhand seiner ID aus der Liste
router.delete('/deleteCountry/:countryID', passport.authenticate('jwt', { session: false }), validateReq.deleteCountryReq, (req, res, next) => {
    const countryToDelete = req.params.countryID;
    Country.deleteCountry(countryToDelete)
        .then(() => {
            return res.json({ success: true, msg: 'Das Land wurde gelöscht' });
        })
        .catch((err) => {
            console.log(err);
            return res.json({ success: false, msg: 'Datenbankfehler: \n' + err })
        })
});

/* Bearbeitet die Zugehörigkeit eines Landes (wird nicht verwendet)
router.post('/updateCountry', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const countryData = {
        countryID: req.body.countryID,
        isEU: req.body.isEU,
        isEFTA: req.body.isEFTA
    }

    if (countryData.isEU && countryData.isEFTA) {
        return res.json({ success: false, msg: 'Ein Land darf nicht gleichzeitig zu EFTA und EU gehören' });
    }
    Country.updateCoutry(countryData.countryID)
        .then((result) => {
            if (result.matchedCount == 0) {
                return res.json({ success: false, msg: 'Das Land wurde nicht gefunden' });
            } else if (result.modifiedCount == 0) {
                return res.json({ success: false, msg: 'Das Land wurde nicht aktualisiert' });
            } else {
                return res.json({ success: true, msg: 'Das Land wurde aktualisiert' });
            }
        })
        .catch((err) => {
            console.log(err);
            return res.json({ success: false, msg: 'Datenbankfehler: \n' + err })
        })
});*/

module.exports = router;