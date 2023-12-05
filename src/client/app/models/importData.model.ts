/**
 * Models für verschiedene Importstatistiken.
*/

/**
 * Model repräsentiert einzelne import Produkte mit 
 * herkunft (originID/originName), ID und Name (productID/Name), 
 * Menge (data) und Datum (importDate) an dem das Produkt importiert wurde.
 */
export interface EsvImport {
  originID: string;
  originName: string;
  productID: string;
  productName: string;
  data: number;
  importDate?: string;
}

/**
 * Model repräsentiert eine Monatsstatistik aus
 * Einfügedatum (insertDate), importDatum (importDate) 
 * und die Menge in verschiedenen Produktkathegorien pro Monat.
*/
export interface MonthStats {
  insertDate: string,
  importDate: string,
  eisendraht_blank: number,
  eisendraht_verzinkt: number,
  eisendraht_sonstiger: number,
  eisendraht_kunststoffummantelt: number,
  stahldraht_weniger_blank: number,
  stahldraht_weniger_verzinkt: number,
  stahldraht_weniger_sonstiger: number,
  stahldraht_mehr_blank: number,
  stahldraht_mehr_verzinkt: number,
  stahldraht_mehr_sonstiger: number,
}

/**
 * Liste von Monatsstatistiken als Model für Server-Response 
*/
export interface MonthReportList {
  success: boolean
  msg: string
  listOfRep: Array<MonthStats>
}

/**
 * Einzelne Monatsstatistik als Model für Server-Response 
*/
export interface MonthReport{
  success: boolean
  msg: string
  monthReport: MonthStats
}

/**
 * Model repräsentiert eine Jahresstatistik aus aufsummierten Monatsstatistiken
*/
export interface YearSum {
  importYear: string,
  numberOfMonths: number,
  eisendraht_blank_sum: number,
  eisendraht_verzinkt_sum: number,
  eisendraht_sonstiger_sum: number,
  eisendraht_kunststoffummantelt_sum: number,
  stahldraht_weniger_blank_sum: number,
  stahldraht_weniger_verzinkt_sum: number,
  stahldraht_weniger_sonstiger_sum: number,
  stahldraht_mehr_blank_sum: number,
  stahldraht_mehr_verzinkt_sum: number,
  stahldraht_mehr_sonstiger_sum: number,
}

/**
 * Model repräsentiert eine Jahresstatistik als Durchschnitt aller Monatsstatistiken des Jahres
*/
export interface YearAvg {
  importYear: string,
  eisendraht_blank_avg: number,
  eisendraht_verzinkt_avg: number,
  eisendraht_sonstiger_avg: number,
  eisendraht_kunststoffummantelt_avg: number,
  stahldraht_weniger_blank_avg: number,
  stahldraht_weniger_verzinkt_avg: number,
  stahldraht_weniger_sonstiger_avg: number,
  stahldraht_mehr_blank_avg: number,
  stahldraht_mehr_verzinkt_avg: number,
  stahldraht_mehr_sonstiger_avg: number,
}

/**
 * Model repräsentiert Menge an Produkten pro Land
*/
export interface countryImport {
  countryID: string,
  countryName: string,
  continent: string,
  isEU: boolean,
  isEFTA: boolean,

  eisendraht_blank: number,
  eisendraht_verzinkt: number,
  eisendraht_sonstiger: number,
  eisendraht_kunststoffummantelt: number,
  stahldraht_weniger_blank: number,
  stahldraht_weniger_verzinkt: number,
  stahldraht_weniger_sonstiger: number,
  stahldraht_mehr_blank: number,
  stahldraht_mehr_verzinkt: number,
  stahldraht_mehr_sonstiger: number,
}

export interface InnerShippingIron {
  reportDate: string;
  ed_sonstig: number;
  ed_verzinkt: number;
}

export interface InnerShippingSteel {
  reportDate: string;
  steel_inland: number;
}