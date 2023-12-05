import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { HelperService } from 'src/client/app/services/helperServices/helper.service';
import { MonthStats, YearAvg } from 'src/client/app/models/importData.model';
import { MarketReport } from 'src/client/app/models/import_market.model';
import { MarketService } from 'src/client/app/services/esvImportServices/market.service';


@Component({
  selector: 'app-esv-market-eisen',
  templateUrl: './esv-market-eisen.component.html',
  styleUrls: ['./esv-market-eisen.component.css']
})
export class EsvMarketEisenComponent implements OnInit, OnChanges {

  constructor(
    private helper: HelperService,
    private marketService: MarketService
  ) { }

  @Input() selectedDate: string = this.helper.getCurrentDateString()
  @Input() monthStats: Array<MonthStats> = new Array
  @Input() yearAvgList: Array<YearAvg> = new Array
  @Input() inlandsversandDaten: any[] = new Array

  ironMarketReport_blank: MarketReport = new MarketReport(new Map, new Map);
  ironMarketReport_verzinkt: MarketReport = new MarketReport(new Map, new Map);

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
    let inlandsversand_blank: Map<string, number> = new Map();
    let imports_blank: Map<string, number> = new Map();

    let inlandsversand_verzinkt: Map<string, number> = new Map();
    let imports_verzinkt: Map<string, number> = new Map();

    // Berechnet für jeden Monat die Summe aller Eisen Produkte für die Kathegorien blank und verzinkt aus den Monatsimporten
    for (let month of this.monthStats) {
      const key = this.helper.getMonthString(month.importDate);

      const value_blank = month.eisendraht_blank + month.eisendraht_sonstiger + month.eisendraht_kunststoffummantelt;
      const value_verzinkt = month.eisendraht_verzinkt;

      imports_blank.set(key, value_blank);
      imports_verzinkt.set(key, value_verzinkt);
    }

    // Berechnet für jedes Quartal und Halbjahr die Summe aller Eisen Produkte aus den Monatsimporten
    imports_blank = this.marketService.mergeMaps(this.marketService.calculateQuarterlyAndHalfYearSums(imports_blank), imports_blank);
    imports_verzinkt = this.marketService.mergeMaps(this.marketService.calculateQuarterlyAndHalfYearSums(imports_verzinkt), imports_verzinkt);

    // Berechnet für jedes der letzten 10 Jahre die Summe aller Eisen Produkte für die Kathegorien blank und verzinkt aus den Jahresdurchschnitten
    for (let yearAvg of this.yearAvgList) {
      if (this.lastTenYears.includes(yearAvg.importYear)) {
        const value_blank = yearAvg.eisendraht_blank_avg + yearAvg.eisendraht_sonstiger_avg + yearAvg.eisendraht_kunststoffummantelt_avg;
        const value_verzinkt = yearAvg.eisendraht_verzinkt_avg;

        imports_blank.set(yearAvg.importYear, value_blank);
        imports_verzinkt.set(yearAvg.importYear, value_verzinkt);
      }
    }

    // Berechne Inlandsversand für das ausgewählte Jahr und den Durchschnitt der letzten 10 Jahre
    const selectedYear = this.helper.getYearString(this.selectedDate);

    for (const inlandsversandItem of this.inlandsversandDaten) {
      const inlandsversandYear = this.helper.getYearString(inlandsversandItem.reportDate);

      // Berechne den Inlandsversand für jeden Monat im ausgewählten Jahr
      if (inlandsversandYear === selectedYear) {
        const key = this.helper.getMonthString(inlandsversandItem.reportDate);
        inlandsversand_blank.set(key, inlandsversandItem.ed_sonstig);
        inlandsversand_verzinkt.set(key, inlandsversandItem.ed_verzinkt);
      }

      // Berechne Inlandsversand für die letzten 10 Jahre im Durchschnitt
      if (this.lastTenYears.includes(inlandsversandYear)) {
        const value_blank = inlandsversandItem.ed_sonstig / 12;
        const value_verzinkt = inlandsversandItem.ed_verzinkt / 12;

        if (inlandsversand_blank.has(inlandsversandYear)) {
          const currentValue = inlandsversand_blank.get(inlandsversandYear)!;
          inlandsversand_blank.set(inlandsversandYear, currentValue + value_blank);
        } else {
          inlandsversand_blank.set(inlandsversandYear, value_blank);
        }

        if (inlandsversand_verzinkt.has(inlandsversandYear)) {
          const currentValue = inlandsversand_verzinkt.get(inlandsversandYear)!;
          inlandsversand_verzinkt.set(inlandsversandYear, currentValue + value_verzinkt);
        } else {
          inlandsversand_verzinkt.set(inlandsversandYear, value_verzinkt);
        }
      }
    }

    
    
    // Berechnet für jedes Quartal und Halbjahr die Summe aller Eisen Produkte aus den Inlandsversanddaten
    inlandsversand_blank = this.marketService.mergeMaps(this.marketService.calculateQuarterlyAndHalfYearSums(inlandsversand_blank), inlandsversand_blank);
    inlandsversand_verzinkt = this.marketService.mergeMaps(this.marketService.calculateQuarterlyAndHalfYearSums(inlandsversand_verzinkt), inlandsversand_verzinkt);

    // Erstelle einen neuen Marktbericht
    this.ironMarketReport_blank = new MarketReport(inlandsversand_blank, imports_blank);
    this.ironMarketReport_verzinkt = new MarketReport(inlandsversand_verzinkt, imports_verzinkt);

    // Berechnet die anzahl an Monaten für die die Marktberichte Blank und Verzinkt Daten haben
    let numberOfMonths_blank = 0;
    let numberOfMonths_verzinkt = 0;

    for (let key of imports_blank.keys()) {
      if (this.firstQuarter.includes(key) || this.secondQuarter.includes(key) || this.thirdQuarter.includes(key) || this.fourthQuarter.includes(key) ) {
        numberOfMonths_blank++;
      }
    }

    for (let key of imports_verzinkt.keys()) {
      if (this.firstQuarter.includes(key) || this.secondQuarter.includes(key) || this.thirdQuarter.includes(key) || this.fourthQuarter.includes(key) ) {
        numberOfMonths_verzinkt++;
      }
    }

    this.ironMarketReport_blank.set_numberOfMonths(numberOfMonths_blank);
    this.ironMarketReport_verzinkt.set_numberOfMonths(numberOfMonths_verzinkt);
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
    const cssFile = require('./esv-market-eisen.component.css').toString();

    const printWindow = window.open('', '', 'height=800,width=1200');

    if (printWindow) {
      const tableToPrint = document.getElementById("printIronMarketRep");

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
