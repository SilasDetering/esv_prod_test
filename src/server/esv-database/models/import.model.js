/**
 * Enthält die hochgeladenen ImportStatss aller Importe von Eisen und Stahl
*/

const mongoose = require('mongoose');

// Schema
const ImportShema = mongoose.Schema({
  originID: { type: String, required: true },
  originName: { type: String, required: true },
  productID: { type: String, required: true },
  productName: { type: String, required: true },
  data: { type: Number, required: true },
  insertDate: { type: String, required: true },
  importDate: { type: String, required: true },
})

// Mit ESV Datenbank verbinden
const esvDB = mongoose.connection.useDb('esvDB')

// Schema exportieren
const ImportStats = module.exports = esvDB.model('import_statistiks', ImportShema)

/**
 * Fügt eine neue Statistik-Meldung hinzu
 * @param data Datensatz aus Statistik-Meldungen
 */
module.exports.addImportData = function (data) {
  return ImportStats.insertMany(data)
}

/**
 * Löscht eine Statistik-Meldung anhand des Datums andem diese Meldung vom Benutzer hinzugefügt wurde
 * @param date Einfüge-Datum anhand dessen die Meldung gelöscht werden soll
 */
module.exports.deleteImportDataByImportDate = function (date) {
  const query = { importDate: date }
  return ImportStats.deleteMany(query)
}

/**
 * Gibt alle Statistik-Meldungen mit dem Datum an dem das Produkt importiert wurde zurück
 * @param date Import-Datum anhand dessen eine Meldung gefunden werden soll
 */
module.exports.findImportDataByImportDate = function (date) {
  const query = { importDate: date }
  const projection = { _id: 0, __v: 0 }
  return ImportStats.find(query, projection)
}

/**
 * Gibt eine Statistik-Meldung mit dem Datum an dem das Produkt importiert wurde zurück
 * @param date Import-Datum anhand dessen eine Meldung gefunden werden soll
 */
module.exports.existsDataWithImportDate = function (date) {
  const query = { importDate: date }
  const projection = { _id: 0, __v: 0 }
  return ImportStats.findOne(query, projection)
}

/**
 * Gibt für jeden Monatsstatistik aus der Datenbank das Datum zurück
 */
module.exports.getImportStatsDates = function () {
  return ImportStats.distinct("importDate", {});
}

module.exports.getCountryImportsForSpecificYear = function (date) {
  const year = date.substring(0, 4); // extract year from date string
  const query = {
    importDate: {
      $regex: new RegExp(`^${year}`)
    }
  }
  const projection = { _id: 0, __v: 0, importDate: 0, insertDate: 0 }
  return ImportStats.find(query, projection)
}