/**
 * Stellt funktionen zur validierung der Req-Bodys für Usermanagement bereit.
*/

/** 
 * @todo Nochmal prüfen ob sicher. Ist User in der Lage isAdmin selber zu setzen und passport.js zu umgehen?
 * 
 * Prüft ob der Benutzer Administratorrechte besitzt. 
 * @err Status 403: Sie besitzen nicht die benötigten Berechtigungen.
 */
module.exports.isAdmin = function(req, res, next) {
  
  if (!req.user.isAdmin) {
    return res.status(403).json({ success: false, error: "Sie besitzen nicht die benötigten Berechtigungen" });
  }

  next();
}

/**
 * Prüft ob die übergebenen Parameter im Req-Body den erwarteten Register-Parametern entsprechen.
 * @returns Status 400: Ungültiger Request Body, falls ungültige Parameter übergeben wurden.
 */
module.exports.registerReq = function(req, res, next) {
  const { username, password, firstName, lastName, email, isAdmin } = req.body;

  if (
    typeof username !== "string" || username.trim().length === 0 ||
    typeof password !== "string" || password.trim().length === 0 ||
    typeof firstName !== "string" || firstName.trim().length === 0 ||
    typeof lastName !== "string" || lastName.trim().length === 0 ||
    typeof email !== "string" || email.trim().length === 0 ||
    typeof isAdmin !== "boolean"
  ) {
    return res.status(400).json({ success: false, msg: "Ungültiger Request Body" });
  }

  next();
}

/**
 * Prüft ob die übergebenen Parameter im Req-Body den erwarteten Auth-Parametern entsprechen.
 * @err Status 400: Ungültiger Request Body.
 */
module.exports.authReq = function(req, res, next) {
  const username = req.body.username;
  const password = req.body.password;

  if (
    typeof username !== "string" || username.trim().length === 0 ||
    typeof password !== "string" || password.trim().length === 0
  ) {
    return res.status(400).json({ success: false, error: "Ungültiger Request Body" });
  }

  next();
}

/**
 * Prüft ob die übergebenen Parameter im Req-Body den erwarteten editUser-Parametern entsprechen.
 * @returns Status 400: Ungültiger Request Body, falls ungültige Parameter übergeben wurden.
 */
module.exports.editUserReq = function(req, res, next) {
  const { oldUsername, username, firstName, lastName, email, isAdmin } = req.body;

  if (
    typeof oldUsername !== "string" || oldUsername.trim().length === 0 ||
    typeof username !== "string" || username.trim().length === 0 ||
    typeof firstName !== "string" || firstName.trim().length === 0 ||
    typeof lastName !== "string" || lastName.trim().length === 0 ||
    typeof email !== "string" || email.trim().length === 0 ||
    typeof isAdmin !== "boolean"
  ) {
    return res.status(400).json({ success: false, msg: "Ungültiger Request Body" });
  }

  next();
}

/**
 * Prüft ob die übergebenen Parameter im Req-Body den erwarteten editPassword-Parametern entsprechen.
 * @returns Status 400: Ungültiger Request Body, falls ungültige Parameter übergeben wurden.
 */
module.exports.editPasswordReq = function(req, res, next) {
  const newPassword = req.body.newPassword;
  const username = req.body.username; 

  if (
    typeof newPassword !== "string" || newPassword.trim().length === 0 ||
    typeof username !== "string" || username.trim().length === 0
  ) {
    return res.status(400).json({ success: false, msg: "Ungültiger Request Body" });
  }
  next();
}

/**
 * Prüft ob die übergebenen Parameter im Req-Body den erwarteten deleteUser-Parametern entsprechen.
 * @returns Status 400: Ungültiger Request Body, falls ungültige Parameter übergeben wurden.
 */
module.exports.deleteUserReq = function(req, res, next) {
  const {username} = req.params;

  console.log(username)


  if (
    typeof username !== "string" || username.trim().length === 0
  ) {
    return res.status(400).json({ success: false, msg: "Ungültiger Request Body" });
  }
  next();
}

