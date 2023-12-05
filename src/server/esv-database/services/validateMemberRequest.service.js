/**
 * Stellt funktionen zur validierung der Req-Bodys für ESV-Member Requests bereit.
*/

// MEMBER REQUESTS =====================================================================================================================================================

/**
 * Prüft ob die übergebenen Parameter im Req-Body den erwarteten addMember-Parametern entsprechen.
 * @returns Status 400: Ungültiger Request Body, falls ungültige Parameter übergeben wurden.
 */
module.exports.addMemberReq = function (req, res, next) {
  const { ID, name, debNr, address, grundbeitrag } = req.body;

  if (
    typeof ID !== 'string' || ID.trim().length === 0 ||
    typeof name !== 'string' || name.trim().length === 0 ||
    typeof grundbeitrag !== 'boolean' ||
    debNr !== undefined && (typeof debNr !== 'number' || isNaN(debNr)) ||
    !isValidAddress(address)
  ) {
    return res.status(400).json({ success: false, msg: "Ungültige Request Parameter" });
  }
  next();
};

function isValidAddress(address) {
  if (!address || typeof address !== 'object') {
    return false;
  }

  const { street, zipCode, city, country } = address;

  if (
    typeof street !== 'string' || street.trim().length === 0 ||
    typeof zipCode !== 'number' || isNaN(zipCode) ||
    typeof city !== 'string' || city.trim().length === 0
  ) {
    return false;
  }

  return true;
}

/**
 * Prüft ob die übergebenen Parameter im Req-Body den erwarteten deleteMember-Parametern entsprechen.
 * @returns Status 400: Ungültiger Request Body, falls ungültige Parameter übergeben wurden.
 */
module.exports.deleteMemberReq = function (req, res, next) {
  const memberToDelete = req.params.id;


  if (
    typeof memberToDelete !== 'string' || memberToDelete.trim().length === 0
  ) {
    return res.status(400).json({ success: false, msg: "Ungültige Request Parameter" });
  }

  next();
}
