/*
    users.js bekommt die http Req, bzgl. aller User bezogenen aktionen vom Client
*/
const express = require('express');
const router = express.Router();
const passport = require('passport');
const tokenService = require('../services/tokenConroller.service');
const validateReq = require('../services/validateUserRequest.service');
const User = require('../models/user.model');

// Register
router.post('/register', passport.authenticate('jwt', { session: false }), validateReq.isAdmin, validateReq.registerReq, (req, res) => {

    // User-Daten zur Erstellung von neuem User aus Http Request auslesen
    let newUser = new User({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        isAdmin: req.body.isAdmin
    })

    // Prüfen ob der Benutzername bereits vorhanden ist
    User.getUserByUsername(newUser.username)
        .then((user) => {
            if (user) {
                return res.json({ success: false, msg: 'Der Benutzername ist bereits vergeben' })
            }
            // Neuen User zur Datenbank hinzufügen.
            User.addUser(newUser)
                .then(() => {
                    return res.json({ success: true, msg: 'Der Benutzer wurde erfolgreich registriert' });
                })
                .catch((err) => {
                    console.log(err);                                                                                           /* CONSOLE LOG */
                    return res.json({ success: false, msg: 'Datenbankfehler: \n' + err })
                })
        })
        .catch((err) => {
            console.log(err);                                                                                                   /* CONSOLE LOG */
            return res.json({ success: false, msg: 'Datenbankfehler: \n' + err })
        })
});

// Authenticate
router.post('/authenticate', validateReq.authReq, (req, res) => {
    const username = req.body.username;
    let password = req.body.password;

    // Prüfen ob Benutzername vorhanden ist
    User.getUserByUsername(username)
        .then((user) => {
            if (!user) {
                return res.json({ success: false, msg: 'Benutzer nicht gefunden: '+ username });
            }
            
            // Passwort des Users prüfen
            User.comparePassword(password, user.password)
                .then((isMatch) => {
                    if (!isMatch) {
                        return res.json({ success: false, msg: 'Falsches Password' });
                    }

                    const token = tokenService.createNewToken(user);
                    // Antword an den Client (Success, Token, User (als neues Objekt, da wir nicht kompletten User mit PW zurückgeben möchten) )
                    res.json({
                        success: true,
                        token: token,
                        user: {
                            id: user._id,
                            firstName: user.firstName,
                            lastname: user.lastName,
                            username: user.username,
                            email: user.email,
                            isAdmin: user.isAdmin
                        }
                    })
                })
            .catch((err) => {
                console.log(err);                                                                                               /* CONSOLE LOG */
                return res.json({ success: false, msg: 'Datenbankfehler: \n' + err })
            })
        })
        .catch((err) => {
            console.log(err);                                                                                                   /* CONSOLE LOG */
            return res.json({ success: false, msg: 'Datenbankfehler: \n' + err })
        })
});

// Profile
router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { password, ...userWithoutPassword } = req.user.toJSON();
    return res.json({ success: true, user: userWithoutPassword })
});

// Change userinformation                                                                                                        
router.put('/editUser', passport.authenticate('jwt', { session: false }), validateReq.isAdmin, validateReq.editUserReq, (req, res) => {
    
    let oldUsername = req.body.oldUsername;
    
    const newUserInformation = {
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        isAdmin: req.body.isAdmin
    };

    // Prüfen ob der Benutzername schon vorhanden ist:
    User.getUserByUsername(newUserInformation.username)
        .then((user) => {
            if (user) {
                if (newUserInformation.username != oldUsername) {
                    return res.json({ success: false, msg: 'Der Benutzername wurde bereits vergeben' });
                }
            }
            // Benutzerdaten updaten
            User.updateUser(oldUsername, newUserInformation)
                .then(() => {
                    return res.json({ success: true, msg: 'Der Benutzer wurde gespeichert' });
                })
                .catch((err) => {
                    console.log(err);                                                                                      /* CONSOLE LOG */
                    return res.json({ success: false, msg: 'Datenbankfehler \n' + err })
                })
        })
        .catch((err) => {
            console.log(err);                                                                                               /* CONSOLE LOG */
            return res.json({ success: false, msg: 'Datenbankfehler \n' + err })
        })
});

// Change PW
router.put('/editPassword', passport.authenticate('jwt', { session: false }), validateReq.isAdmin, validateReq.editPasswordReq, (req, res) => {
    let newPassword = req.body.newPassword;
    const username = req.body.username;

    // Benutzer heraussuchen
    User.getUserByUsername(username)
        .then((user) => {
            if (!user) {
                return res.json({ success: false, msg: 'Der Benutzer konnte nicht gefunden werden' });
            }
            // Passwort ändern
            User.changePassword(username, newPassword)
                .then(() => {
                    return res.json({ success: true, msg: 'Das Password wurde gespeichert' });
                })
                .catch((err) => {
                    console.log(err);                                                                                      /* CONSOLE LOG */
                    return res.json({ success: false, msg: 'Datenbankfehler \n' + err })
                })
        })
        .catch((err) => {
            console.log(err);                                                                                               /* CONSOLE LOG */
            return res.json({ success: false, msg: 'Datenbankfehler \n' + err })
        })
});

// Löscht einen User aus der Datenbank anhand seines Benutzernamens
router.delete('/deleteUser/:username', passport.authenticate('jwt', { session: false }), validateReq.isAdmin, validateReq.deleteUserReq, (req, res) => {
    const { username } = req.params;

    // Prüfen ob der zu löschende User ein Admin ist
    User.getUserByUsername(username)
        .then((user) => {
            if (user != null) {
                if (user.isAdmin) return res.json({ success: false, msg: 'Administratoren können nicht auf diesem Weg entfernt werden' });
            }
        })
        .catch((err) => {
            console.log(err);                                                                                               /* CONSOLE LOG */
            return res.json({ success: false, msg: 'Datenbankfehler \n' + err })
        })

    // User löschen
    User.deleteUser(username)
        .then((deletedUser) => {
            if (!deletedUser) {
                return res.json({ success: false, msg: 'Der Benutzer mit dem Namen ' + username + ' konnte nicht entfernt werden' });
            } else {
                return res.json({ success: true, msg: 'Der Benutzer ' + deletedUser.username + ' wurde entfernt' });
            }
        })
        .catch((err) => {
            console.log(err);                                                                                               /* CONSOLE LOG */
            return res.json({ success: false, msg: 'Datenbankfehler \n' + err })
        })
});

// Gibt eine Liste mit allen Benutzern zurück
router.get('/getUserList', passport.authenticate('jwt', { session: false }), validateReq.isAdmin, (req, res) => {
    User.getUserList()
        .then((users) => {
            return res.json({ success: true, userList: users });
        })
        .catch((err) => {
            console.log(err);                                                                                               /* CONSOLE LOG */
            return res.json({ success: false, msg: 'Datenbankfehler \n' + err })
        })
});

module.exports = router;