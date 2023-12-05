/**
 * Stellt funktionen zur validierung der Req-Bodys für ESV-Data / ESV-Country Requests bereit.
*/

/** 
 * Prüft ob die übergebenen Parameter im Req-Body den erwarteten saveImportData-Parametern entsprechen.
 * @returns Status 400: Ungültiger Request Body, falls ungültige Parameter übergeben wurden.
 */
module.exports.saveDataReq = function (req, res, next) {
    const dataAsJSONSet = req.body.data;
    
    if (!dataAsJSONSet) {
        return res.status(400).json({ success: false, msg: 'Ungültiger Request Body' });
    }

    // JSON-Daten in Objekt-Array umwandeln
    const dataAsObjectSet = dataAsJSONSet.map(data => {
      return {
        originID: data.originID?.trim(),
        originName: data.originName?.trim(),
        productID: data.productID?.trim(),
        productName: data.productName?.trim(),
        data: Number(data.data),
        importDate: data.importDate?.trim(),
        insertDate: data.insertDate?.trim(), 
      };
    });
  
    // Validierung der Daten
    for (let i = 0; i < dataAsObjectSet.length; i++) {
      const data = dataAsObjectSet[i];
  
      if (
        !data.originID || typeof data.originID !== 'string' ||
        !data.originName || typeof data.originName !== 'string' ||
        !data.productID || typeof data.productID !== 'string' ||
        !data.productName || typeof data.productName !== 'string' ||
        isNaN(data.data) ||
        !data.importDate || typeof data.importDate !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(data.importDate)
      ) {
        return res.status(400).json({ success: false, msg: 'Ungültiger Request Body' });
      }
    }
    
    req.dataAsObjectSet = dataAsObjectSet;
    next();
}

/**
 * Prüft ob der übergebene Date Parameter im Request Body der gewünschten Date Syntax entspricht (JJJJ-MM-TT)
 * @returns Status 400: Ungültiger Request Body, falls ungültige Parameter übergeben wurden.
 */
module.exports.dateSyntax = function (req, res, next) {
    const date = req.params.date

    if (
        typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
        return res.status(400).json({ success: false, msg: "Ungültiges Datum oder Format ( JJJJ-MM-TT )" });
    }

    next();
}

/**
 * Prüft ob der übergebene Year Parameter im Request Body der gewünschten Year Syntax entspricht (JJJJ)
 * @returns Status 400: Ungültiger Request Body, falls ungültige Parameter übergeben wurden.
 */
module.exports.getYearSumReq = function (req, res, next) {
    const year = req.params.year

    if (year && (typeof year !== 'string' || !/^\d{4}$/.test(year))) {
        return res.status(400).json({ success: false, msg: "Ungültiges Format ( JJJJ )" });
    }

    next();
}

/**
 * Prüft falls ein Date Parameter übergeben wurde, ob dieser der gewünschten Date-Syntax entspricht (JJJJ-MM-TT)
 * @returns Status 400: Ungültiger Request Body, falls ungültige Parameter übergeben wurden.
 */
module.exports.getMonthlyImportStatsReq = function (req, res, next) {
    const date = req.params.date

    if (date && date !== 'all' && (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date))) {
        return res.status(400).json({ success: false, msg: "Ungültiges Datum oder Format ( JJJJ-MM-TT )" });
    }

    next();
}


// COUNTRY REQUESTS =====================================================================================================================================================


/**
 * Prüft ob die übergebenen Parameter im Req-Body den erwarteten saveImportData-Parametern entsprechen.
 * @returns Status 400: Ungültiger Request Body, falls ungültige Parameter übergeben wurden.
 */
module.exports.getCountryListReq = function (req, res, next) {
    const { filter } = req.params;

    if (
        typeof filter !== 'string' || filter.trim().length === 0 || !isValidContinent(filter)
    ) {
        return res.status(400).json({ success: false, msg: "Ungültige Request Parameter" });
    }

    next();
}

/**
 * Prüft ob die übergebenen Parameter im Req-Body den erwarteten addCountry-Parametern entsprechen.
 * @returns Status 400: Ungültiger Request Body, falls ungültige Parameter übergeben wurden.
 */
module.exports.addCountryReq = function (req, res, next) {
    const { countryID, name, continent, isEU, isEFTA } = req.body;

    if (
        typeof countryID !== 'string' || countryID.trim().length === 0 ||
        typeof name !== 'string' || name.trim().length === 0 ||
        typeof continent !== 'string' || continent.trim().length === 0 || !isValidContinent(continent) || continent === "all" ||
        typeof isEU !== "boolean" ||
        typeof isEFTA !== "boolean" ||
        (isEU && isEFTA) || continent !== "Europa" && (isEU || isEFTA)
    ) {
        return res.status(400).json({ success: false, msg: "Ungültige Request Parameter" });
    }

    next();
}

/**
 * Prüft ob die übergebenen Parameter im Req-Body den erwarteten deleteCountry-Parametern entsprechen.
 * @returns Status 400: Ungültiger Request Body, falls ungültige Parameter übergeben wurden.
 */
module.exports.deleteCountryReq = function (req, res, next) {
    const countryToDelete = req.params.countryID;

    if (
        typeof countryToDelete !== 'string' || countryToDelete.trim().length === 0
    ) {
        return res.status(400).json({ success: false, msg: "Ungültige Request Parameter" });
    }

    next();
}

// Prüft ob der Kontinent existiert
function isValidContinent(continent) {
    if (continent == "all" || continent == "Europa" || continent == "Asien" || continent == "Afrika" || continent == "Südamerika"
        || continent == "Nordamerika" || continent == "Antarktis" || continent == "Ozeanien") {
        return true;
    }
    return false;
}