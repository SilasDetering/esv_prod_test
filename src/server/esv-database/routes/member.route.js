const express = require('express');
const router = express.Router();
const Member = require('../models/members.model');
const passport = require('passport');
const validateReq = require('../services/validateMemberRequest.service')

// Gibt eine Liste aller Mitglieder zurück
router.get('/getMemberList', passport.authenticate('jwt', { session: false }), (req, res, next) => {

    Member.getMemberList()
        .then((members) => {
            return res.json({ success: true, memberList: members });
        })
        .catch((err) => {
            console.log(err);
            return res.json({ success: false, msg: 'Datenbankfehler: ' + err })
        })
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

    Member.getMemberById(newMember.ID)
        .then((memberById) => {
            if (memberById) {
                return res.json({
                    success: false,
                    msg: `Das Mitglied mit der ID ${newMember.ID} ist bereits vorhanden`,
                });
            } else {
                Member.addMember(newMember)
                    .then(() => {
                        return res.json({ success: true, msg: 'Das Mitglied wurde hinzugefügt' });
                    })
                    .catch((err) => {
                        console.log(err);
                        return res.json({ success: false, msg: 'Datenbankfehler: ' + err })
                    })
            }
        })
        .catch((err) => {
            console.log(err);
            return res.json({ success: false, msg: 'Datenbankfehler: ' + err })
        })
});

// Löscht ein Mitglied anhand seiner ID aus der Liste
router.delete('/deleteMember/:id', passport.authenticate('jwt', { session: false }), validateReq.deleteMemberReq, (req, res, next) => {
    const memberToDelete = req.params.id;

    Member.deleteMember(memberToDelete)
        .then(() => {
            return res.json({ success: true });
        })
        .catch((err) => {
            console.log(err);
            return res.json({ success: false, msg: 'Datenbankfehler: ' + err })
        })
});

// Gibt alle Mitglieder einer Gruppe zurück
router.get('/MembersOfGroup/:group', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const group = req.params.group;

    if (group == null) {
        return res.json({ success: true, memberList: [] });
    }

    Member.getGroupMembersByMember(group)
        .then((members) => {
            return res.json({ success: true, memberList: members });
        })
        .catch((err) => {
            console.log(err);
            return res.json({ success: false, msg: 'Datenbankfehler: ' + err })
        })
})

module.exports = router;