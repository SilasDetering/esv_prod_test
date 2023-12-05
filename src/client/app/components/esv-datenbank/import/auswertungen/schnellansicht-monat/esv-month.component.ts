import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { EsvDataService } from 'src/client/app/services/esvImportServices/esv-data.service';
import { HelperService } from 'src/client/app/services/helperServices/helper.service';
import { MonthStats, YearAvg } from 'src/client/app/models/importData.model';
import { FlashMessageService } from 'src/client/app/services/flashMessageServices/flash-message.service';

@Component({
  selector: 'app-esv-month',
  templateUrl: './esv-month.component.html',
  styleUrls: ['./esv-month.component.css']
})
export class EsvMonthComponent implements OnInit, OnChanges {

  @Input() selectedDate: string = ""
  @Input() monthStats: Array<MonthStats> = new Array
  @Input() yearAvgList: Array<YearAvg> = new Array

  previousMonthDate: string = ""
  chosenMonthStats: MonthStats | null = null
  previousMonthStats: MonthStats | null = null
  previousYearAvg: YearAvg | undefined

  constructor(private esvDataService: EsvDataService, private helper: HelperService, private flashMessage: FlashMessageService) { }

  ngOnInit(): void {
    this.selectedDate = this.helper.getCurrentDateString();
    this.selectedDate = this.selectedDate.slice(0, -2) + "01";
    this.ngOnChanges(null);
  }

  /**
   * Lädt die Daten für die Tabelle wenn sich das Datum ändert
   * @param changes
   */
  ngOnChanges(changes: SimpleChanges | null): void {
    this.setMonthStats(this.selectedDate);
    const selectedYear = ( parseInt(this.helper.getYearString(this.selectedDate))-1 ).toString()    
    this.previousYearAvg = this.helper.returnListOfChosenYears([selectedYear], this.yearAvgList)[0];
  }

  /**
   * Sucht aus [monthStats] das gewählte Datum heraus und schreibt den Eintrag in [chosenMonthStats].
   * Zusätlich sucht es den vorherigen Monat heraus und setzt diesen in [lastMonthStats].
   * @param date Ein Datum als String im Format (JJJJ-MM-TT).
   */
  private setMonthStats(date: string) {
    if (date !== "") {
      var monthStats = this.monthStats.find(
        (stats) =>
          stats.importDate === date
      );
      if (monthStats) {
        this.chosenMonthStats = monthStats;
      } else {
        this.chosenMonthStats = null;
      }

      this.previousMonthDate = this.helper.getPreviousMonthDate(date)

      monthStats = this.monthStats.find(
        (stats) =>
          stats.importDate === this.previousMonthDate
      );
      if (monthStats) {
        this.previousMonthStats = monthStats;
      } else {
        this.previousMonthStats = null;
      }
    }
  }

  /**
   * Helper und Wrapper Methoden für die HTML
   */
  round(val: number): number {return this.helper.round(val)}
  getWrittenMonth(date: string) {return this.helper.getMonthString(date)}
  getWrittenYear(date: string) {return this.helper.getYearString(date)}
  getPreviousDate(date: string) {return this.helper.getPreviousMonthDate(date)}
  addNumbers(number: (number|undefined)[]) { return this.helper.addNumbers(number)}
  parseInteger(val: string) { return parseInt(val) }

  // Funktion um die aktuelle Tabelle auszudrucken
  async print(): Promise<void> {
    const response = await fetch("https://bootswatch.com/5/flatly/bootstrap.min.css");
    const cssText = await response.text();
    const cssFile = require('./esv-month.component.css').toString();

    const printWindow = window.open('', '', 'height=800,width=1200');

    if (printWindow) {
      const tableToPrint = document.getElementById("printMonthRep");

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
