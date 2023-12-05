/**
 * dateUtils.service stellt operationen für die Datumsangaben im String Format bereit 
*/

/**
 * Berechnet das aktuelle Datum
 * @return das aktuelle Datum als String im Format JJJJ-MM-TT zurück
 */
function getCurrentDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/**
 * Setzt den Tag eines Datums auf den erstsen Tag des Monats 
 * @param date Das Datum im Format JJJJ-MM-TT als String
 * @returns Das Datum als JJJJ-MM-01
 */
function normDate(date) {
    const [jahr, monat, tag] = date.split('-'); 
    date = `${jahr}-${monat}-01`;
    return date
}

/**
 * Gibt das Jahr aus einem Datum zurück
 * @param date  Das Datum im Format JJJJ-MM-TT als String
 * @returns das Jahr aus dem Datum
 */
function getYearFromDate(date){
    const [jahr, monat, tag] = date.split('-');
    return jahr
}

module.exports = { getCurrentDateString, normDate, getYearFromDate };