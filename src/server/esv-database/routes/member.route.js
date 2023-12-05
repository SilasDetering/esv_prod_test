const express = require('express');
const router = express.Router();
const Member = require('../models/members.model');
const passport = require('passport');
const validateReq = require('../services/validateMemberRequest.service')

// Gibt eine Liste aller Mitglieder zurück
router.get('/getMemberList', passport.authenticate('jwt', { session: false }), (req, res, next) => {

    Member.getMemberList((err, members) => {
        if (err) {
            console.log("Datenbankfehler: " + err);                                                                                     /* CONSOLE LOG */
            res.json({ success: false, msg: 'Datenbankfehler' });
        }
        return res.json({ success: true, memberList: members });
    });
});

// Fügt ein neues Mitglied in die Datenbank ein
router.post('/addMember', passport.authenticate('jwt', { session: false }), validateReq.addMemberReq, (req, res, next) => {
    const newMember = {
        ID: req.body.ID,
        name: req.body.name,
        group: req.body.group,
        debNr: req.body.debNr,
        address: req.body.address,
        grundbeitrag: req.body.grundbeitrag,
    };

    Member.getMemberById(newMember.ID, (err, memberById) => {
        if (err) {
            console.log("Datenbankfehler: " + err);                                                                                     /* CONSOLE LOG */
            return res.json({ success: false, msg: 'Datenbankfehler' });
        }
        if (memberById) {
            return res.json({
                success: false,
                msg: `Das Mitglied mit der ID ${newMember.ID} ist bereits vorhanden`,
            });
        }

        Member.addMember(newMember, (err) => {
            if (err) {
                console.log("Datenbankfehler: " + err);                                                                                     /* CONSOLE LOG */
                return res.json({ success: false, msg: 'Datenbankfehler' });
            }

            return res.json({ success: true, msg: 'Das Mitglied wurde hinzugefügt' });
        });
    });
});

// Löscht ein Mitglied anhand seiner ID aus der Liste
router.delete('/deleteMember/:id', passport.authenticate('jwt', { session: false }), validateReq.deleteMemberReq, (req, res, next) => {
    const memberToDelete = req.params.id;
    Member.deleteMember(memberToDelete, (err) => {
        if (err) {
            res.json({ success: false, msg: 'Beim Löschen des Mitgliedes ist ein Fehler aufgetreten' });
            console.log("Datenbankfehler: " + err);                                                                                     /* CONSOLE LOG */
        } else {
            return res.json({ success: true });
        }
    })
});

// Gibt alle Mitglieder einer Gruppe zurück
router.get('/MembersOfGroup/:group', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const group = req.params.group;

    if(group == null){
        return res.json({ success: true, memberList: [] });
    }

    Member.getGroupMembersByMember(group, (err, members) => {
        if(err){
            res.json({ success: false, msg: 'Bei der Suche nach Mitgliedern ist ein Fehler aufgetreten' });
            console.log("Datenbankfehler: " + err);                                                                                     /* CONSOLE LOG */
        } else {
            return res.json({ success: true, memberList: members });
        }
    })
})

module.exports = router;