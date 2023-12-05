/*
    users.js bekommt die http Req, bzgl. aller User bezogenen aktionen vom Client
*/
const express = require('express');
const router = express.Router();
const passport = require('passport');
const tokenService = require('../services/tokenConroller.service');
const validateReq = require('../services/validateUserRequestBody.service');
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
    User.getUserByUsername(newUser.username, (err, user) => {
        if (err) {
            console.log(err)                                                                                                /* CONSOLE LOG */
            return res.json({ success: false, msg: 'Datenbankfehler' })
        }
        if (user) {
            return res.json({ success: false, msg: 'Benutzername ist bereits vergeben' })
        }

        // Neuen User zur Datenbank hinzufügen.
        User.addUser(newUser, (err) => {
            //Prüfen ob der neue Benutzer erfolgreich hinzugefügt wurde:
            if (err) {
                console.log(err);                                                                                           /* CONSOLE LOG */
                return res.json({ success: false, msg: 'Datenbankfehler' })
            } else {
                return res.json({ success: true, msg: 'Benutzer registriert' });
            }
        })
    })
});

// Authenticate
router.post('/authenticate', validateReq.authReq, (req, res) => {
    // Username und Passwort auslesen
    const username = req.body.username;
    let password = req.body.password;

    // Prüfen ob Benutzername vorhanden ist
    User.getUserByUsername(username, (err, user) => {
        if (err) {
            console.log("ERROR in '/authenticate' (src/serve/authentication/routes/user.route: 67)\n" + err);                 // CONSOLE LOG
            return res.json({ success: false, msg: 'Es ist ein Fehler aufgetreten' })
        } else if (!user) {
            return res.json({ success: false, msg: 'Der Benutzer wurde nicht gefunden' })
        }
        // Password auf Korrektheit prüfen. Bei richtigem Passwort Token erstellen und zurückgeben. Token läuft nach einer Woche ab! 
        User.comparePassword(password, user.password, (err, isMatch) => {
            if (err) {
                console.log("ERROR in '/authenticate' (src/serve/authentication/routes/user.route: 75)\n" + err);             // CONSOLE LOG
                return res.json({ success: false, msg: 'Es ist ein Fehler aufgetreten' })
            }
            if (isMatch) {
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
            } else {
                return res.json({ success: false, msg: 'Falsches Password' });
            }
        })
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
    User.getUserByUsername(newUserInformation.username, (err, user) => {

        if (err) {
            console.log(err);                                                                                               /* CONSOLE LOG */
            return res.json({ success: false, msg: 'Datenbankfehler' });
        }
        if (user) {
            if (newUserInformation.username != oldUsername) {
                return res.json({ success: false, msg: 'Der Benutzername wurde bereits vergeben' });
            }
        }
        // Benutzerdaten updaten
        User.updateUser(oldUsername, newUserInformation, (err) => {
            if (err) {
                console.log(err);                                                                                      /* CONSOLE LOG */
                return res.json({ success: false, msg: 'Datenbankfehler' })
            }
            return res.json({ success: true, msg: 'Der Benutzer wurde gespeichert' });
        })

    });
});

// Change PW
router.put('/editPassword', passport.authenticate('jwt', { session: false }), validateReq.isAdmin, validateReq.editPasswordReq, (req, res) => {
    let newPassword = req.body.newPassword;
    const username = req.body.username;

    // Benutzer heraussuchen
    User.getUserByUsername(username, (err, user) => {
        if (err) {
            console.log(err);                                                                                                       /* CONSOLE LOG */
            return res.json({ success: false, msg: 'Datenbankfehler' })
        } else if (!user) {
            return res.json({ success: false, msg: 'Zurücksetzen des Passwords fehlgeschlagen' });
        } else {
            // Password ändern
            User.changePassword(username, newPassword, (err) => {
                if (err) {
                    console.log(err);                                                                                               /* CONSOLE LOG */
                    return res.json({ success: false, msg: 'Datenbankfehler' })
                }
                return res.json({ success: true, msg: 'Das Password wurde gespeichert' });
            })
        }
    })
});

// Löscht einen User aus der Datenbank anhand seines Benutzernamens
router.delete('/deleteUser/:username', passport.authenticate('jwt', { session: false }), validateReq.isAdmin, validateReq.deleteUserReq, (req, res) => {
    const { username } = req.params;

    User.getUserByUsername(username, (err, user) => {
        if (err) throw err;
        if (user != null) {
            if (user.isAdmin) return res.json({ success: false, msg: 'Administratoren können nicht auf diesem Weg entfernt werden' });
        }
    });

    User.deleteUser(username, (err, deletedUser) => {
        if (err) throw err;
        if (!deletedUser) {
            return res.json({ success: false, msg: 'Der Benutzer mit dem Namen ' + username + ' konnte nicht entfernt werden' });
        } else {
            // Falls vorhanden Session vom zu löschenden User entfernen.
            Session.getSessionByID(deletedUser._id, (err, session) => {
                // console.log("Zu löschende Session: " + session)                                                          //CONSOLE LOG
                if (err) throw err;
                if (session) {
                    Session.removeSession(session.sessionToken, (err) => {
                        if (err) throw err;
                    });
                }
            });
            return res.json({ success: true, msg: 'Der Benutzer ' + deletedUser.username + ' wurde entfernt' });
        }
    });
});

// Gibt eine Liste mit allen Benutzern zurück
router.get('/getUserList', passport.authenticate('jwt', { session: false }), validateReq.isAdmin, (req, res) => {
    User.getUserList((err, users) => {
        if (err) {
            res.json({ success: false, msg: 'Beim laden der Benutzer ist ein Fehler aufgetreten' });
        }
        return res.json({ success: true, userList: users });
    });
});

module.exports = router;