const express = require('express');
const router = express.Router();
const Country = require('../models/countries.model');
const passport = require('passport');
const validateReq = require('../services/validateESVRequest.service')

// Gibt eine Liste aller Länder zurück gefiltert nach Kontinent
router.get('/getCountryList/:filter', passport.authenticate('jwt', { session: false }), validateReq.getCountryListReq, (req, res, next) => {
    var { filter } = req.params;
    
    Country.getCountryList(filter, (err, countries) => {
        if (err) {
            console.log("Datenbankfehler: " + err);                                                                                                                               /* CONSOLE LOG */
            res.json({ success: false, msg: 'Datenbankfehler' });
        }
        return res.json({ success: true, countryList: countries });
    });
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
    Country.getCountryByName(newCountry.name, (err, country) => {
        if(err){
            console.log("Datenbankfehler: " + err);                                                                                                                               /* CONSOLE LOG */
            res.json({ success: false, msg: 'Datenbankfehler' });
        }
        if(country){
            res.json({ success: false, msg: 'Das Land mit dem Namen '+ newCountry.name +' ist bereits vorhanden' });
        }else{
            // Prüfen ob ein Land mit der selben countryID schon vorhanden ist
            Country.getCountryById(newCountry.countryID, (err, country) => {
                if(err){
                    console.log("Datenbankfehler: " + err);                                                                                                                       /* CONSOLE LOG */
                    res.json({ success: false, msg: 'Datenbankfehler' });
                }
                if(country){
                    res.json({ success: false, msg: 'Das Land mit der ID '+ newCountry.countryID +' ist bereits vorhanden' });
                }else{
                    // Land hinzufügen
                    Country.addCountry(newCountry, (err) => {
                        if (err) {
                            console.log("Datenbankfehler: " + err);                                                                                                               /* CONSOLE LOG */
                            res.json({ success: false, msg: 'Datenbankfehler' });
                        } else {
                            return res.json({ success: true, msg: 'Das Land wurde hinzugefügt' });
                        }
                    });
                }
            })
        }
    })
});

// Löscht ein Land anhand seiner ID aus der Liste
router.delete('/deleteCountry/:countryID', passport.authenticate('jwt', { session: false }), validateReq.deleteCountryReq, (req, res, next) => {
    const countryToDelete = req.params.countryID;
    Country.deleteCountry(countryToDelete, (err) => {
        if (err) {
            res.json({ success: false, msg: 'Beim Löschen des Landes ist ein Fehler aufgetreten' });
        } else {
            return res.json({ success: true });
        }
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
    Country.updateCoutry(countryData.countryID, countryData, (err) => {
        if (err) {
            res.json({ success: false, msg: 'Beim aktualisieren der Länder ist ein Fehler aufgetreten' });
        }
        return res.json({ success: true, msg: 'Das Land wurde aktualisiert' });
    });
});*/

module.exports = router;