import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { HelperService } from 'src/client/app/services/helperServices/helper.service';
import { MonthStats, YearAvg } from 'src/client/app/models/importData.model';
import { MarketReport } from 'src/client/app/models/import_market.model';
import { MarketService } from 'src/client/app/services/esvImportServices/market.service';

@Component({
  selector: 'app-esv-market-stahl',
  templateUrl: './esv-market-stahl.component.html',
  styleUrls: ['./esv-market-stahl.component.css']
})
export class EsvMarketStahlComponent implements OnInit, OnChanges {

  constructor(
    private helper: HelperService,
    private marketService: MarketService
  ) { }

  @Input() selectedDate: string = this.helper.getCurrentDateString()
  @Input() monthStats: Array<MonthStats> = new Array
  @Input() yearAvgList: Array<YearAvg> = new Array
  @Input() inlandsversandDaten: any[] = new Array

  steelMarketReport: MarketReport = new MarketReport(new Map, new Map);

  lastTenYears: Array<string> = this.helper.getLast10YearsFromDate(this.selectedDate);
  firstQuarter: Array<string> = ["Januar", "Februar", "März"];
  secondQuarter: Array<string> = ["April", "Mai", "Juni"];
  thirdQuarter: Array<string> = ["Juli", "August", "September"];
  fourthQuarter: Array<string> = ["Oktober", "November", "Dezember"];

  ngOnInit(): void {
    this.recalculate();
  }

  /**
   * Lädt die Daten für die Tabelle wenn sich das Datum ändert
   * @param changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    this.recalculate();
  }

  /**
   * Berechnet alle Werte neu
   */
  recalculate(): void {
    this.lastTenYears = this.helper.getLast10YearsFromDate(this.selectedDate);
    this.calculateMarktetReport();
  }

  /**
   * Berechnet alle Werte für den Marktbericht
   */
  calculateMarktetReport(): void {
    let inlandsversand: Map<string, number> = new Map();
    let imports: Map<string, number> = new Map();

    // Berechnet für jeden Monat die Summe aller Stahl Produkte aus den Monatsimporten
    for (let month of this.monthStats) {
      const key = this.helper.getMonthString(month.importDate);
      const value = month.stahldraht_weniger_blank + month.stahldraht_weniger_verzinkt + month.stahldraht_weniger_sonstiger
        + month.stahldraht_mehr_blank + month.stahldraht_mehr_verzinkt + month.stahldraht_mehr_sonstiger;

      imports.set(key, value);
    }

    // Berechnet für jedes Quartal und Halbjahr die Summe aller Stahl Produkte aus den Monatsimporten
    imports = this.marketService.mergeMaps(this.marketService.calculateQuarterlyAndHalfYearSums(imports), imports);


    // Berechnet für jedes der letzten 10 Jahre die Summe aller Stahl Produkte aus den Jahresdurchschnitten
    for (let yearAvg of this.yearAvgList) {
      if (this.lastTenYears.includes(yearAvg.importYear)) {
        const value = yearAvg.stahldraht_weniger_blank_avg + yearAvg.stahldraht_weniger_verzinkt_avg + yearAvg.stahldraht_weniger_sonstiger_avg
          + yearAvg.stahldraht_mehr_blank_avg + yearAvg.stahldraht_mehr_verzinkt_avg + yearAvg.stahldraht_mehr_sonstiger_avg;

        imports.set(yearAvg.importYear, value);
      }
    }

    // Berechne Inlandsversand für das ausgewählte Jahr und den Durchschnitt der letzten 10 Jahre
    const selectedYear = this.helper.getYearString(this.selectedDate);

    for (const inlandsversandItem of this.inlandsversandDaten) {
      const inlandsversandYear = this.helper.getYearString(inlandsversandItem.reportDate);

      // Berechne den Inlandsversand für jeden Monat im ausgewählten Jahr
      if (inlandsversandYear === selectedYear) {
        const key = this.helper.getMonthString(inlandsversandItem.reportDate);
        inlandsversand.set(key, inlandsversandItem.steel_inland);
      }

      // Berechne Inlandsversand für die letzten 10 Jahre im Durchschnitt
      if (this.lastTenYears.includes(inlandsversandYear)) {
        const value = inlandsversandItem.steel_inland / 12;
        if (inlandsversand.has(inlandsversandYear)) {
          const currentValue = inlandsversand.get(inlandsversandYear)!;
          inlandsversand.set(inlandsversandYear, currentValue + value);
        } else {
          inlandsversand.set(inlandsversandYear, value);
        }
      }
    }
    
    // Berechnet für jedes Quartal und Halbjahr die Summe aller Stahl Produkte aus den Monatsimporten
    inlandsversand = this.marketService.mergeMaps(this.marketService.calculateQuarterlyAndHalfYearSums(inlandsversand), inlandsversand);

    // Erstelle einen neuen Marktbericht
    this.steelMarketReport = new MarketReport(inlandsversand, imports);

    // Berechnet die anzahl an Monaten für die der Marktbericht Daten hat
    let numberOfMonths = 0;
    for (let key of imports.keys()) {
      if (this.firstQuarter.includes(key) || this.secondQuarter.includes(key) || this.thirdQuarter.includes(key) || this.fourthQuarter.includes(key) ) {
        numberOfMonths++;
      }
    }
    this.steelMarketReport.set_numberOfMonths(numberOfMonths);
  }

  /**
   * Wrapper Funktionen um den/das Monat/Jahr als String zu bekommen
   * @param date Datum als String
   */
  getWrittenMonth(date: string) { return this.helper.getMonthString(date) }
  getWrittenYear(date: string) { return this.helper.getYearString(date) }

  // Funktion um die aktuelle Tabelle auszudrucken
  async print(): Promise<void> {
    const response = await fetch("https://bootswatch.com/5/flatly/bootstrap.min.css");
    const cssText = await response.text();
    const cssFile = require('./esv-market-stahl.component.css').toString();

    const printWindow = window.open('', '', 'height=800,width=1200');

    if (printWindow) {
      const tableToPrint = document.getElementById("printSteelmarketRep");

      if (tableToPrint) {
        const tableHTML = tableToPrint.outerHTML;

        printWindow.document.open();
        printWindow.document.write(`
          <html>
            <head>
            <style>
            ${cssText}
            ${cssFile}
            </style>
            </head>
            
            <body>
              ${tableHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      } else {
        printWindow.close();
      }
    } else {
      console.error('Failed to open print window.');
    }
  }
}
