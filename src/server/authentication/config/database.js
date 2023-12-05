/**
 * Datenbank Konfiguration enthält den Pfad zur MongoDB und das symetrische Secret-Token für die JSON-Webtoken Verschlüsselung 
 */
module.exports = {
    // Pfad zur DB
    database: 'mongodb://127.0.0.1:27017/default',
    // Token
    secret: '8C1DA5F924279E7998AD8485CDEFE0B572BEBA76E5CDA7D84EB7DE49BA2D809F',
}