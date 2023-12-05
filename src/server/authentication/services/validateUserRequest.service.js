/**
 * Stellt funktionen zur validierung der Req-Bodys für Usermanagement bereit.
*/

/**  
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
    validateEmail(email) === null ||
    validatePassword(password) === null ||
    validateName(firstName) === null ||
    validateName(lastName) === null ||
    validateName(username) === null ||
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
    validateName(username) === null ||
    validatePassword(password) === null
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
    validateName(oldUsername) === null ||
    validateName(username) === null ||
    validateName(firstName) === null ||
    validateName(lastName) === null ||
    validateEmail(email) === null ||
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
    validatePassword(newPassword) === null ||
    validateName(username) === null
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
  if (
    validateName(username) === null
  ) {
    return res.status(400).json({ success: false, msg: "Ungültiger Request Body" });
  }
  next();
}


function validateEmail(email) {
  if(email == undefined) return false;
  const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  return re.test(email);
}

function validatePassword(password) {
  if(password == undefined) return false;
  console.log(password)
  var requirement = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,20}$/;
  console.log(password.match(requirement))
  return password.match(requirement);
}

function validateName(name) {
  if(name == undefined) return false;
  if(typeof name !== "string") return false;
  if(name.trim().length <= 3) return false;
  return true
}