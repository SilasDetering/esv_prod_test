/**
 * helper.service stellt verschiedene Hilfsfunktionen für die verarbeitung von Datum-Strings, oder runden und addieren von Daten im html bereit.
*/

import { Injectable } from '@angular/core';
import { MonthStats, YearAvg } from '../../models/importData.model';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor() { }

  /**
   * Berechnet das aktuelle Datum
   * @return das aktuelle Datum als String im Format JJJJ-MM-TT zurück
   */
  getCurrentDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  /**
   * Setzt den Tag eines Datums auf den erstsen Tag des Monats
   * @param date Datum als String im Format (JJJJ-MM-TT)
   * @returns genormtes Datum als String (JJJJ-MM-01)
   */
  normDate(date: string): string {
    const [jahr, monat, tag] = date.split('-');
    date = `${jahr}-${monat}-01`;
    return date
  }

  /**
   * Gibt den Monatsnamen des übergebenen Datums zurück
   * @param date String als Datum im Format JJJJ-MM-TT
   * @returns Monatsnahme
   */
  getMonthString(date?: string): string {
    if(!date){
      return "(No Month given)";
    }

    const monthNames = [
      "Januar",
      "Februar",
      "März",
      "April",
      "Mai",
      "Juni",
      "Juli",
      "August",
      "September",
      "Oktober",
      "November",
      "Dezember",
    ];
    const month = this.getMonth(date);

    return `${monthNames[month - 1]}`;
  }

  /**
   * Gibt den Monat eines Datums als number zurück
   * @param date Datum als String im Format JJJJ-MM-TT
   * @returns Monat vom Typ number
   */
  getMonth(date: string): number {
    const [year, month] = date.split("-");
    return Number(month)
  }

  /**
   * Gibt das Quatal eines Datums im Stringformat zurück
   * @param date datum als String im Format JJJJ-MM-TT
   * @returns Quatal als String (Bspw. "1. Quartal")
   */
  getQuarterString(date: string): string {
    const quarterNames = [
      "1. Quartal",
      "2. Quartal",
      "3. Quartal",
      "4. Quartal",
    ];
    const quarter = this.getQuarter(date) -1;
    return `${quarterNames[quarter]}`;
  }

  /**
   * Gibt das Quatal eines Datums als Zahl zurück
   * @param date datum als String im Format JJJJ-MM-TT
   * @returns Quatal als Zahl vom Typ number
   */
  getQuarter(date: string): number {
    const [year, month] = date.split("-");
    const quarter = Math.ceil(Number(month) / 3);
    return quarter;
  }

  /**
   * Gibt das Datum des vorherigen Jahres zurück
   * @param date Datum als String im Format JJJJ-MM-TT
   * @returns Datum des vorherigen Jahres als String im Format JJJJ-MM-TT
   */
  getPreviousYearDate(date: string): string {
    const [year, month, day] = date.split("-");
    const previousYear = Number(year) - 1;
    return `${previousYear}-${month}-${day}`;
  }

  /**
   * Gibt das Jahr von einem Datum im Stringformat zurück
   * @param date String im Format JJJJ-MM-TT
   * @returns Datum als String im Format TT.MM.JJJJ
   */
  getDateString(date: string): string{
    const [year, month, day] = date.split('-');
    return day + "." + month + "." + year
  }

  /**
   * Gibt das Jahr von einem Datum im Stringformat zurück
   * @param date String im Format JJJJ-MM-TT
   * @returns Jahr (JJJJ)
   */
  getYearString(date?: string): string {
    if(!date){
      return "(No Year given)";
    }

    const [year] = date.split("-");
    return `${year}`;
  }

  writeNumberAsEuro(value: number): string {
    return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
  }

  /**
   * Berechnet aus dem übergebenen Datums String JJJJ-MM-TT das Datum des vorherigen Monats
   * @param date Datum als String im Format JJJJ-MM-TT
   * @returns vorheriges Datum als String im Format JJJJ-MM-TT
   */
  getPreviousMonthDate(date: string): string {
    const [year, month, _] = date.split('-').map(Number);
    const lastMonthDate = new Date(year, month - 1, 1);
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonthYear = lastMonthDate.getMonth() === 11 ? year - 1 : year;
    const lastMonthMonth = (lastMonthDate.getMonth() + 1).toString().padStart(2, '0');
    return `${lastMonthYear}-${lastMonthMonth}-01`;
  }

  /**
   * Gibt die Statistik eines Gewünschten Monats aus einer Liste von Monatsstatistiken zurück
   * @param monthStats Liste von Monatsstatistiken
   * @param month Monat der gesucht wird (1 = Jannuar, 2 = Februar, ...)
   * @returns Monatsstatistik des gewählten Monats oder [null] falls der gewünschte Monat nicht enthalten ist
   */
  getSpecificMonth(monthStats: Array<MonthStats>, month: number): MonthStats | null {
    const targetMonth = month < 10 ? `0${month}` : `${month}`; // add leading zero if month < 10
    for (const monthStat of monthStats) {
      const importDate = monthStat.importDate;
      const monthPart = importDate.split("-")[1];
      if (monthPart === targetMonth) {
        return monthStat;
      }
    }
    return null;
  }

  /**
  * Rundet einen Wert auf eine Nachkommastelle nach dem Kaufmannprinzip
  * @param val Zahl die gerundet werden soll
  * @returns gerundete Zahl
  */
  round(val: number): number {
    return Math.round((val + Number.EPSILON) * 100) / 100
  }

  /**
  * Addiert eine Liste von Zahlen variabler länge. Falls ein Wert undefined ist wird dieser ignoriert.
  * @param numbers List von Zahlen variabler länge
  * @returns Zahl als Number. Gibt 0 zurück falls keine Zahlen gefunden wurden.
  */
  sum(numbers: (number | undefined | null)[]): number {
    let sum = 0;
    let foundNumbers = false;

    for (let number of numbers) {
      if (typeof number === 'number' && !isNaN(number)) {
        sum += number;
        foundNumbers = true;
      }
    }
    sum = this.round(sum)
    return foundNumbers ? sum : 0;
  }

  /**
  * Addiert eine Liste von Zahlen variabler länge. Falls ein Wert undefined ist wird dieser ignoriert.
  * @param numbers List von Zahlen variabler länge
  * @returns Zahl als String
  */
  addNumbers(numbers: (number | undefined | null)[]): string {
    let sum = 0;
    let foundNumbers = false;

    for (let number of numbers) {
      if (typeof number === 'number' && !isNaN(number)) {
        sum += number;
        foundNumbers = true;
      }
    }
    sum = this.round(sum)
    return foundNumbers ? sum.toString() : '';
  }

  /**
   * Sortiert ein Array von [MonthStats] nach dem import Datum
   * @param monthStats Array von MonthStats
   * @returns sortiertes Array von MonthStats
   */
  sortMonthStats(monthStats: Array<MonthStats>): Array<MonthStats> {
    return monthStats.sort((a, b) => {
      const dateA = new Date(a.importDate.split('-').reverse().join('-'));
      const dateB = new Date(b.importDate.split('-').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });
  }

  /**
   * Sortiert eine Liste von Monatsstatistiken anhand ihres [importDate]. 
   * Jede Monatsstatistik wird entsprechend des Monats als Index in der Liste gespeichert.
   * Fehlende Monate ergeben Leere Einträge in der Liste
   * @param monthStats Liste von Monatsstatistiken
   * @returns sortierte Liste von Monatsstatistiken
   */
  sortAndGroupByMonth(monthStats: Array<MonthStats>) {
    // Sortiere den Datensatz nach importDate
    monthStats.sort((a, b) => a.importDate.localeCompare(b.importDate));

    // Gruppiere den Datensatz nach Monat
    const groupedmonthStats = Array(12);
    monthStats.forEach((item) => {
      const monthIndex = parseInt(item.importDate.slice(5, 7)) - 1;
      groupedmonthStats[monthIndex] = item;
    });

    return groupedmonthStats;
  }

  /**
   * Filtert aus einer List von Daten die Daten heraus die zu den übergebenen Jahresangaben passen
   * @param years Liste von Jahren nach denen gefiltert werden soll
   * @param data Daten die gefiltert werden sollen
   * @returns Liste von nach Jahresangaben gefilterten Daten. Absteigent sortiert
   */
  returnListOfChosenYears(years: string[], data: YearAvg[]): YearAvg[] {
    const chosenYearAvgs: YearAvg[] = [];

    years.forEach((year) => {
      const yearAvg = data.find((item) => item.importYear === year);
      if (yearAvg) {
        chosenYearAvgs.push(yearAvg);
      } else (
        chosenYearAvgs.push(
          {
            importYear: year,
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
      ));
    });

    return chosenYearAvgs.sort((a, b) => parseInt(a.importYear) - parseInt(b.importYear));
  }

  /**
   * Addiert zwei Euro-Beträge und gibt das Ergebnis als Euro-Betrag zurück
   * @param amount1 im Format 123,45€
   * @param amount2 im Format 123,45€
   * @returns Zusammengerechneter Betrag im Format 123,45€
   */
  addEuroAmounts(amount1: string, amount2: string): string {
    // Entferne das Euro-Zeichen und alle Nicht-Ziffern-Zeichen von den Beträgen
    const cleanAmount1 = amount1.replace(/[^\d,]/g, '');
    const cleanAmount2 = amount2.replace(/[^\d,]/g, '');
  
    // Parse die bereinigten Beträge zu Dezimalzahlen
    const parsedAmount1 = parseFloat(cleanAmount1.replace(',', '.'));
    const parsedAmount2 = parseFloat(cleanAmount2.replace(',', '.'));
  
    // Addiere die Beträge
    const sum = parsedAmount1 + parsedAmount2;
  
    // Formatiere die Summe zurück in das Euro-Betragsformat
    const formattedSum = sum.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + '€';
  
    return formattedSum;
  }

  /**
   * Gibt die letzten 10 Jahre ab dem übergebenen Datum zurück
   * @param date Datum ab dem die letzten 10 Jahre zurückgegeben werden sollen
   * @returns Liste von Jahren als String
   */
  getLast10YearsFromDate(date: string): string[] {
    const givenYear = parseInt(date.substring(0, 4));
    const last10Years = [];
  
    for (let i = 10; i >= 1; i--) {
      const year = givenYear - i;
      last10Years.push(year.toString());
    }
    return last10Years;
  }
}
