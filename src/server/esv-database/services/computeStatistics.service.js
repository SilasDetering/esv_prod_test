/**
 * computeStatistiks.service stellt Funtkionen für die Berechnung von verschiedenen Statistiken für esvData.route zur verfügung
*/

const Report = require('../models/import.model');
const MonthReport = require('../models/import_month.model');
const YearStats = require('../models/import_avg.model');
const Countries = require('../models/countries.model');
const { getCurrentDateString, getYearFromDate } = require('./dateUtils.service');

/** 
 * Berechnet die Menge aller Produkte die in einem Monat importiert wurden anhand der Produktkategorieren. Es wird nur dann die Monatsmenge berechnet, wenn das Land in der Datenbank gespeichert wurde.
 * @param date Datum des Monats von dem die Import Menge berechnet werden soll. (String im Format JJJJ-MM-TT)
 * @throws Wirft einen Fehler falls der Datenbankzugriff fehlgelaufen ist, Keine Einträge für das Datum gefunden wurden, Eine unbekannte Produkt-ID gefunden wurde
 */
function calculateMonthSum(date) {
    // Alten Monatseintrag löschen falls vorhanden
    MonthReport.deleteMonthRepByImportDate(date, (err) => {
        if (err) throw Error(err)

        // Alle Importe vom Datum [date] aus der Datenbank laden
        Report.findImportDataByImportDate(date, (err, data) => {
            if (err) {
                throw new Error(err);
            } if (!data) {
                throw new Error("Es konten keine Einträge für das Datum '" + date + "' in der Datenbank gefunden werden")
            } else {
                var newMonthEntry = {
                    importDate: date,
                    insertDate: getCurrentDateString(),
                    eisendraht_blank: 0,
                    eisendraht_verzinkt: 0,
                    eisendraht_sonstiger: 0,
                    eisendraht_kunststoffummantelt: 0,
                    stahldraht_weniger_blank: 0,
                    stahldraht_weniger_verzinkt: 0,
                    stahldraht_weniger_sonstiger: 0,
                    stahldraht_mehr_blank: 0,
                    stahldraht_mehr_verzinkt: 0,
                    stahldraht_mehr_sonstiger: 0,
                }

                // Alle ImportDaten anhand der Produktkategorie aufsummieren, falls das Land in der Datenbank gespeichert wurde
                Countries.getListOfCountryIDs((err, countryIDs) => {
                    if (err) throw new Error(err)
                    if (!countryIDs) throw new Error("Keine LänderIDs gefunden")

                    data.forEach(element => {
                        if (countryIDs.includes(element.originID)) {
                            switch (element.productID) {
                                case "WA72171010, WA72171039":
                                    newMonthEntry.eisendraht_blank += element.data;
                                    break;
                                case "WA72172010, WA72172030":
                                    newMonthEntry.eisendraht_verzinkt += element.data;
                                    break;
                                case "WA72173041, WA72173049":
                                    newMonthEntry.eisendraht_sonstiger += element.data;
                                    break;
                                case "WA72179020":
                                    newMonthEntry.eisendraht_kunststoffummantelt += element.data;
                                    break;
                                case "WA72171050":
                                    newMonthEntry.stahldraht_weniger_blank += element.data;
                                    break;
                                case "WA72172050":
                                    newMonthEntry.stahldraht_weniger_verzinkt += element.data;
                                    break;
                                case "WA72179050":
                                    newMonthEntry.stahldraht_weniger_sonstiger += element.data;
                                    break;
                                case "WA72171090":
                                    newMonthEntry.stahldraht_mehr_blank += element.data;
                                    break;
                                case "WA72172090":
                                    newMonthEntry.stahldraht_mehr_verzinkt += element.data;
                                    break;
                                case "WA72173090, WA72179090":
                                    newMonthEntry.stahldraht_mehr_sonstiger += element.data;
                                    break;
                                default:
                                    throw new Error("Die ProduktID '" + element.productID + "' ist nicht bekannt!");
                            }
                        }
                    })

                    // Werte kaufmännisch Runden, da Javaskript nicht rechnen kann
                    newMonthEntry.eisendraht_blank = round(newMonthEntry.eisendraht_blank);
                    newMonthEntry.eisendraht_verzinkt = round(newMonthEntry.eisendraht_verzinkt);
                    newMonthEntry.eisendraht_sonstiger = round(newMonthEntry.eisendraht_sonstiger);
                    newMonthEntry.eisendraht_kunststoffummantelt = round(newMonthEntry.eisendraht_kunststoffummantelt);
                    newMonthEntry.stahldraht_weniger_blank = round(newMonthEntry.stahldraht_weniger_blank);
                    newMonthEntry.stahldraht_weniger_verzinkt = round(newMonthEntry.stahldraht_weniger_verzinkt);
                    newMonthEntry.stahldraht_weniger_sonstiger = round(newMonthEntry.stahldraht_weniger_sonstiger);
                    newMonthEntry.stahldraht_mehr_blank = round(newMonthEntry.stahldraht_mehr_blank);
                    newMonthEntry.stahldraht_mehr_verzinkt = round(newMonthEntry.stahldraht_mehr_verzinkt);
                    newMonthEntry.stahldraht_mehr_sonstiger = round(newMonthEntry.stahldraht_mehr_sonstiger);

                    // Neue Monatsstatistik speichern
                    MonthReport.addMonthReport(newMonthEntry, (err) => {
                        if (err) throw new Error(err)
                        // Jahresstatistik aktualisieren
                        else { calculateYearStats(date) }
                    })
                })
            }
        });
    })
}

/**
 * Berechnet anhand der Monatsstatistiken die Jahressumme der Importstatistiken eines Jahres
 * @param date Das Jahr für welches die Statistik berechnet werden soll (String im Format "JJJJ-MM-TT")
 * @throws Wirft einen Fehler falls der Datenbankzugriff fehlgelaufen ist
 */
function calculateYearStats(date) {
    year = getYearFromDate(date)

    // Löscht veraltete Statistik des Jahres falls vorhanden
    YearStats.removeYearStat(year, (err) => {
        if (err) throw Error(err)

        // Summiert die Produktmengen der einzelnen Monate auf
        MonthReport.getMonthRepsByYear(date, (err, monthStats) => {
            if (err) throw new Error(err)

            // Zähle anzahl Monatsstatistiken passend zum Jahr (.length funktioniert nicht weil javaSc scheiße ist)
            countReturns = 0
            monthStats.forEach(() => countReturns++)

            var newYearStatsEntry = {
                importYear: year,
                numberOfMonths: countReturns,
                eisendraht_blank_sum: 0,
                eisendraht_verzinkt_sum: 0,
                eisendraht_sonstiger_sum: 0,
                eisendraht_kunststoffummantelt_sum: 0,
                stahldraht_weniger_blank_sum: 0,
                stahldraht_weniger_verzinkt_sum: 0,
                stahldraht_weniger_sonstiger_sum: 0,
                stahldraht_mehr_blank_sum: 0,
                stahldraht_mehr_verzinkt_sum: 0,
                stahldraht_mehr_sonstiger_sum: 0,
            }

            // Werte aufsummieren
            monthStats.forEach(element => {
                newYearStatsEntry.eisendraht_blank_sum += element.eisendraht_blank;
                newYearStatsEntry.eisendraht_verzinkt_sum += element.eisendraht_verzinkt;
                newYearStatsEntry.eisendraht_sonstiger_sum += element.eisendraht_sonstiger;
                newYearStatsEntry.eisendraht_kunststoffummantelt_sum += element.eisendraht_kunststoffummantelt;
                newYearStatsEntry.stahldraht_weniger_blank_sum += element.stahldraht_weniger_blank;
                newYearStatsEntry.stahldraht_weniger_verzinkt_sum += element.stahldraht_weniger_verzinkt;
                newYearStatsEntry.stahldraht_weniger_sonstiger_sum += element.stahldraht_weniger_sonstiger;
                newYearStatsEntry.stahldraht_mehr_blank_sum += element.stahldraht_mehr_blank;
                newYearStatsEntry.stahldraht_mehr_verzinkt_sum += element.stahldraht_mehr_verzinkt;
                newYearStatsEntry.stahldraht_mehr_sonstiger_sum += element.stahldraht_mehr_sonstiger;
            })

            // Werte runden
            newYearStatsEntry.eisendraht_blank_sum = round(newYearStatsEntry.eisendraht_blank_sum);
            newYearStatsEntry.eisendraht_verzinkt_sum = round(newYearStatsEntry.eisendraht_verzinkt_sum);
            newYearStatsEntry.eisendraht_sonstiger_sum = round(newYearStatsEntry.eisendraht_sonstiger_sum);
            newYearStatsEntry.eisendraht_kunststoffummantelt_sum = round(newYearStatsEntry.eisendraht_kunststoffummantelt_sum);
            newYearStatsEntry.stahldraht_weniger_blank_sum = round(newYearStatsEntry.stahldraht_weniger_blank_sum);
            newYearStatsEntry.stahldraht_weniger_verzinkt_sum = round(newYearStatsEntry.stahldraht_weniger_verzinkt_sum);
            newYearStatsEntry.stahldraht_weniger_sonstiger_sum = round(newYearStatsEntry.stahldraht_weniger_sonstiger_sum);
            newYearStatsEntry.stahldraht_mehr_blank_sum = round(newYearStatsEntry.stahldraht_mehr_blank_sum);
            newYearStatsEntry.stahldraht_mehr_verzinkt_sum = round(newYearStatsEntry.stahldraht_mehr_verzinkt_sum);
            newYearStatsEntry.stahldraht_mehr_sonstiger_sum = round(newYearStatsEntry.stahldraht_mehr_sonstiger_sum);

            // Fügt neue Jahresstatistik in die Datenbank ein
            YearStats.addYearStat(newYearStatsEntry, (err) => { if (err) throw new Error(err) })
        })
    })
}

/**
 * Gibt den Jahresdurchschnitt einer Liste von Monatsstatistiken zurück
 * @param listOfMonthData Liste von Monatsstatistiken
 * @returns Durchschnittliche Importmenge eines Jahres 
 */
function calculateMonthAverage(listOfMonthData) {

    let avgMonthImportStats = new Array

    // Berechnet für jeden Datenstatz den Durchschnitt | Durchschnitt = Summe / numberOfMonths
    listOfMonthData.forEach(element => {
        const avgMonthImport = {
            importYear: element.importYear,
            eisendraht_blank_avg: 0,
            eisendraht_verzinkt_avg: 0,
            eisendraht_sonstiger_avg: 0,
            eisendraht_kunststoffummantelt_avg: 0,
            stahldraht_weniger_blank_avg: 0,
            stahldraht_weniger_verzinkt_avg: 0,
            stahldraht_weniger_sonstiger_avg: 0,
            stahldraht_mehr_blank_avg: 0,
            stahldraht_mehr_verzinkt_avg: 0,
            stahldraht_mehr_sonstiger_avg: 0,
        }

        // Werte runden
        avgMonthImport.eisendraht_blank_avg = round(element.eisendraht_blank_sum / element.numberOfMonths);
        avgMonthImport.eisendraht_verzinkt_avg = round(element.eisendraht_verzinkt_sum / element.numberOfMonths);
        avgMonthImport.eisendraht_sonstiger_avg = round(element.eisendraht_sonstiger_sum / element.numberOfMonths);
        avgMonthImport.eisendraht_kunststoffummantelt_avg = round(element.eisendraht_kunststoffummantelt_sum / element.numberOfMonths);
        avgMonthImport.stahldraht_weniger_blank_avg = round(element.stahldraht_weniger_blank_sum / element.numberOfMonths);
        avgMonthImport.stahldraht_weniger_verzinkt_avg = round(element.stahldraht_weniger_verzinkt_sum / element.numberOfMonths);
        avgMonthImport.stahldraht_weniger_sonstiger_avg = round(element.stahldraht_weniger_sonstiger_sum / element.numberOfMonths);
        avgMonthImport.stahldraht_mehr_blank_avg = round(element.stahldraht_mehr_blank_sum / element.numberOfMonths);
        avgMonthImport.stahldraht_mehr_verzinkt_avg = round(element.stahldraht_mehr_verzinkt_sum / element.numberOfMonths);
        avgMonthImport.stahldraht_mehr_sonstiger_avg = round(element.stahldraht_mehr_sonstiger_sum / element.numberOfMonths);

        avgMonthImportStats.push(avgMonthImport);
    })
    return avgMonthImportStats;
}

/**
 * Fügt countryList und importData anhand der originID zusammen. ImportData wird pro Land anahnd der ProduktIDs zusammengefasst
 * @param countryList im JSON format
 * @param importData im JSON format 
 * @returns zusammengefügte JSON files
 */
function getImportForEachCountry(importData, countryList) {
    const merged = {};
    merged.list = [];

    countryList.forEach(country => {
        const mergedData = {
            countryID: country.countryID,
            countryName: country.name,
            continent: country.continent,
            isEU: country.isEU,
            isEFTA: country.isEFTA,

            eisendraht_blank: 0,
            eisendraht_verzinkt: 0,
            eisendraht_sonstiger: 0,
            eisendraht_kunststoffummantelt: 0,
            stahldraht_weniger_blank: 0,
            stahldraht_weniger_verzinkt: 0,
            stahldraht_weniger_sonstiger: 0,
            stahldraht_mehr_blank: 0,
            stahldraht_mehr_verzinkt: 0,
            stahldraht_mehr_sonstiger: 0,
        }

        importData.forEach(element => {
            if (country.countryID === element.originID) {

                switch (element.productID) {
                    case "WA72171010, WA72171039":
                        mergedData.eisendraht_blank += element.data;
                        break;
                    case "WA72172010, WA72172030":
                        mergedData.eisendraht_verzinkt += element.data;
                        break;
                    case "WA72173041, WA72173049":
                        mergedData.eisendraht_sonstiger += element.data;
                        break;
                    case "WA72179020":
                        mergedData.eisendraht_kunststoffummantelt += element.data;
                        break;
                    case "WA72171050":
                        mergedData.stahldraht_weniger_blank += element.data;
                        break;
                    case "WA72172050":
                        mergedData.stahldraht_weniger_verzinkt += element.data;
                        break;
                    case "WA72179050":
                        mergedData.stahldraht_weniger_sonstiger += element.data;
                        break;
                    case "WA72171090":
                        mergedData.stahldraht_mehr_blank += element.data;
                        break;
                    case "WA72172090":
                        mergedData.stahldraht_mehr_verzinkt += element.data;
                        break;
                    case "WA72173090, WA72179090":
                        mergedData.stahldraht_mehr_sonstiger += element.data;
                        break;
                    default:
                        throw new Error("Die ProduktID '" + element.productID + "' ist nicht bekannt!");
                }
            }
        })

        // Leere Einträge ignorieren
        if(mergedData.eisendraht_blank + mergedData.eisendraht_verzinkt + mergedData.eisendraht_sonstiger + mergedData.eisendraht_kunststoffummantelt 
            + mergedData.stahldraht_weniger_blank + mergedData.stahldraht_weniger_verzinkt + mergedData.stahldraht_weniger_sonstiger
            + mergedData.stahldraht_mehr_blank + mergedData.stahldraht_mehr_verzinkt + mergedData.stahldraht_mehr_sonstiger == 0){
            return;
        }

        // Werte kaufmännisch Runden, da Javaskript nicht rechnen kann
        mergedData.eisendraht_blank = round(mergedData.eisendraht_blank);
        mergedData.eisendraht_verzinkt = round(mergedData.eisendraht_verzinkt);
        mergedData.eisendraht_sonstiger = round(mergedData.eisendraht_sonstiger);
        mergedData.eisendraht_kunststoffummantelt = round(mergedData.eisendraht_kunststoffummantelt);
        mergedData.stahldraht_weniger_blank = round(mergedData.stahldraht_weniger_blank);
        mergedData.stahldraht_weniger_verzinkt = round(mergedData.stahldraht_weniger_verzinkt);
        mergedData.stahldraht_weniger_sonstiger = round(mergedData.stahldraht_weniger_sonstiger);
        mergedData.stahldraht_mehr_blank = round(mergedData.stahldraht_mehr_blank);
        mergedData.stahldraht_mehr_verzinkt = round(mergedData.stahldraht_mehr_verzinkt);
        mergedData.stahldraht_mehr_sonstiger = round(mergedData.stahldraht_mehr_sonstiger);

        merged.list.push(mergedData);
    })

    return merged;
}

/**
 * Rundet einen Wert auf eine Nachkommastelle nach dem Kaufmannprinzip
 * @param val Zahl die gerundet werden soll
 * @returns Zahl gerundet auf eine Nachkommastelle
 */
function round(val) {
    return Math.round((val + Number.EPSILON) * 100) / 100
}

module.exports = { calculateMonthSum, round, calculateYearStats, calculateMonthAverage, getImportForEachCountry };