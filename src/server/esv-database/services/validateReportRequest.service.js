/**
 * Stellt funktionen zur validierung der Req-Bodys für ESV-Meldungen-Requests bereit.
*/


/* ======================================== Allgemein ======================================== */

/**
 * Prüft ob die übergebenen Parameter im Req-Body den erwarteten getFilteredListOfReports-Parametern entsprechen.
 * Für Eisen und Stahl Reports.
 * @returns Status 400: Ungültiger Request Body, falls ungültige Parameter übergeben wurden.
 */
module.exports.getFilteredListOfReportsReq = function (req, res, next) {
    const { ids, dates } = req.body;
    
    if (
        !Array.isArray(ids) ||
        !Array.isArray(dates) ||
        !ids.every((element) => typeof element === "string") ||
        !dates.every((element) => typeof element === "string")
    ) {
        return res.status(400).json({ success: false, msg: "Ungültige Request Parameter" });
    }

    next();
}

/** 
 * Prüft ob die übergebenen Parameter im Req-Body den erwarteten getReportByDate-Parametern entsprechen.
 * Für Eisen und Stahl Reports.
 * @returns Status 400: Ungültiger Request Body, falls ungültige Parameter übergeben wurden.
 */
module.exports.getRepByDateReq = function (req, res, next) {
    if (typeof req.body.date !== 'string' || req.body.date.trim() === '') {
        return res.status(400).json({ success: false, msg: 'Ungültiger Wert für Date' });
    }
    next()
}

/** 
 * Prüft ob die übergebenen Parameter im Req-Body den erwarteten deleteReport-Parametern entsprechen.
 * Für Eisen und Stahl Reports.
 * @returns Status 400: Ungültiger Request Body, falls ungültige Parameter übergeben wurden.
 */
module.exports.deleteReportReq = function (req, res, next) {
    companyID = req.body.companyID,
    reportDate = req.body.reportDate

    if (typeof companyID !== 'string' || companyID.trim() === '') {
        return res.status(400).json({ success: false, msg: 'Ungültiger Wert für companyID' });
    }
    
    if (typeof reportDate !== 'string' || reportDate.trim() === '') {
        return res.status(400).json({ success: false, msg: 'Ungültiger Wert für reportDate' });
    }

    req.data = {companyID, reportDate}
    next();    
}


/* ======================================== EISEN ======================================== */

/** 
 * Prüft ob die übergebenen Parameter im Req-Body den erwarteten addIronImport-Parametern entsprechen.
 * @returns Status 400: Ungültiger Request Body, falls ungültige Parameter übergeben wurden.
 */
module.exports.addIronReportReq = function (req, res, next) {
    const newReport = {
        companyID: req.body.companyID,
        reportDate: req.body.reportDate,
        blumendraht_inland: req.body.blumendraht_inland,
        flachdraht_inland: req.body.flachdraht_inland,
        kettendraht_inland: req.body.kettendraht_inland,
        npStahldraehte_inland: req.body.npStahldraehte_inland,
        nietendraht_inland: req.body.nietendraht_inland,
        schraubendraht_inland: req.body.schraubendraht_inland,
        ed_blank_verkupfert_inland: req.body.ed_blank_verkupfert_inland,
        ed_geglueht_inland: req.body.ed_geglueht_inland,
        ed_verzinkt_bis_6_inland: req.body.ed_verzinkt_bis_6_inland,
        ed_verzinkt_ueber_6_inland: req.body.ed_verzinkt_ueber_6_inland,
        ed_verzinnt_inland: req.body.ed_verzinnt_inland,
        ed_kuststoffummantelt_inland: req.body.ed_kuststoffummantelt_inland,
        stangendraht_inland: req.body.stangendraht_inland,
        sonstige_inland: req.body.sonstige_inland,
        blumendraht_export: req.body.blumendraht_export,
        flachdraht_export: req.body.flachdraht_export,
        kettendraht_export: req.body.kettendraht_export,
        npStahldraehte_export: req.body.npStahldraehte_export,
        nietendraht_export: req.body.nietendraht_export,
        schraubendraht_export: req.body.schraubendraht_export,
        ed_blank_verkupfert_export: req.body.ed_blank_verkupfert_export,
        ed_geglueht_export: req.body.ed_geglueht_export,
        ed_verzinkt_bis_6_export: req.body.ed_verzinkt_bis_6_export,
        ed_verzinkt_ueber_6_export: req.body.ed_verzinkt_ueber_6_export,
        ed_verzinnt_export: req.body.ed_verzinnt_export,
        ed_kuststoffummantelt_export: req.body.ed_kuststoffummantelt_export,
        stangendraht_export: req.body.stangendraht_export,
        sonstige_export: req.body.sonstige_export,

        country_exports: req.body.country_exports
    }

    if (typeof newReport.companyID !== 'string' || newReport.companyID.trim() === '') {
        return res.status(400).json({ success: false, msg: 'Ungültiger Wert für companyID' });
    }
    
    if (typeof newReport.reportDate !== 'string' || newReport.reportDate.trim() === '') {
        return res.status(400).json({ success: false, msg: 'Ungültiger Wert für reportDate' });
    }

    try {
        if (Array.isArray(newReport.country_exports)) {
          newReport.country_exports.forEach(element => {
            if (
              typeof element.countryID !== 'string' ||
              element.countryID.trim() === ''
            ) {
              throw new Error('Ungültiger Wert für countryID');
            }
            if (typeof element.amount !== 'number' || element.amount < 0) {
              throw new Error('Ungültiger Wert für amount');
            }
          });
        } else {
          throw new Error('Ungültiger Wert für country_exports');
        }
      } catch (error) {
        return res.status(400).json({ success: false, msg: error.message });
    }
      
    const numericFields = [
        'blumendraht_inland',
        'flachdraht_inland',
        'kettendraht_inland',
        'npStahldraehte_inland',
        'nietendraht_inland',
        'schraubendraht_inland',
        'ed_blank_verkupfert_inland',
        'ed_geglueht_inland',
        'ed_verzinkt_bis_6_inland',
        'ed_verzinkt_ueber_6_inland',
        'ed_verzinnt_inland',
        'ed_kuststoffummantelt_inland',
        'stangendraht_inland',
        'sonstige_inland',
        'blumendraht_export',
        'flachdraht_export',
        'kettendraht_export',
        'npStahldraehte_export',
        'nietendraht_export',
        'schraubendraht_export',
        'ed_blank_verkupfert_export',
        'ed_geglueht_export',
        'ed_verzinkt_bis_6_export',
        'ed_verzinkt_ueber_6_export',
        'ed_verzinnt_export',
        'ed_kuststoffummantelt_export',
        'stangendraht_export',
        'sonstige_export'
    ];
    
    for (const field of numericFields) {
        const value = req.body[field];
        if (typeof value !== 'number' || value < 0) {
            return res.status(400).json({ success: false, msg: `Ungültiger Wert für ${field}` });
        }
    }
    
    req.data = newReport;
    next();    
}

/* ======================================== STAHL ======================================== */

/** 
 * Prüft ob die übergebenen Parameter im Req-Body den erwarteten addSteelImport-Parametern entsprechen.
 * @returns Status 400: Ungültiger Request Body, falls ungültige Parameter übergeben wurden.
 */
module.exports.addSteelReportReq = function (req, res, next) {
    const newReport = {
        companyID: req.body.companyID,
        reportDate: req.body.reportDate,
        
        seildraht_inland: req.body.seildraht_inland,
        polsterfederdraht_inland: req.body.polsterfederdraht_inland,
        federdraht_SH_SL_SM_inland: req.body.federdraht_SH_SL_SM_inland,
        federdraht_DH_DM_inland: req.body.federdraht_DH_DM_inland,
        federdraht_sonstig_inland: req.body.federdraht_sonstig_inland,
        draehte_sonstige_inland: req.body.draehte_sonstige_inland,

        seildraht_export: req.body.seildraht_export,
        polsterfederdraht_export: req.body.polsterfederdraht_export,
        federdraht_SH_SL_SM_export: req.body.federdraht_SH_SL_SM_export,
        federdraht_DH_DM_export: req.body.federdraht_DH_DM_export,
        federdraht_sonstig_export: req.body.federdraht_sonstig_export,
        draehte_sonstige_export: req.body.draehte_sonstige_export,

        country_exports: req.body.country_exports
    }

    if (typeof newReport.companyID !== 'string' || newReport.companyID.trim() === '') {
        return res.status(400).json({ success: false, msg: 'Ungültiger Wert für companyID' });
    }
    
    if (typeof newReport.reportDate !== 'string' || newReport.reportDate.trim() === '') {
        return res.status(400).json({ success: false, msg: 'Ungültiger Wert für reportDate' });
    }

    try {
        if (Array.isArray(newReport.country_exports)) {
          newReport.country_exports.forEach(element => {
            if (
              typeof element.countryID !== 'string' ||
              element.countryID.trim() === ''
            ) {
              throw new Error('Ungültiger Wert für countryID');
            }
            if (typeof element.amount !== 'number' || element.amount < 0) {
              throw new Error('Ungültiger Wert für amount');
            }
          });
        } else {
          throw new Error('Ungültiger Wert für country_exports');
        }
      } catch (error) {
        return res.status(400).json({ success: false, msg: error.message });
    }
      
    const numericFields = [
        'seildraht_inland',
        'polsterfederdraht_inland',
        'federdraht_SH_SL_SM_inland',
        'federdraht_DH_DM_inland',
        'federdraht_sonstig_inland',
        'draehte_sonstige_inland',
        'seildraht_export',
        'polsterfederdraht_export',
        'federdraht_SH_SL_SM_export',
        'federdraht_DH_DM_export',
        'federdraht_sonstig_export',
        'draehte_sonstige_export',
    ];
    
    for (const field of numericFields) {
        const value = req.body[field];
        if (typeof value !== 'number' || value < 0) {
            return res.status(400).json({ success: false, msg: `Ungültiger Wert für ${field}` });
        }
    }
    
    req.data = newReport;
    next();    
}