import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { HelperService } from 'src/client/app/services/helperServices/helper.service';
import { MonthStats, YearSum, YearAvg } from 'src/client/app/models/importData.model';
import { EsvDataService } from 'src/client/app/services/esvImportServices/esv-data.service';
import { Subscription } from 'rxjs';
import { FlashMessageService } from 'src/client/app/services/flashMessageServices/flash-message.service';

@Component({
  selector: 'app-esv-year',
  templateUrl: './esv-year.component.html',
  styleUrls: ['./esv-year.component.css']
})
export class EsvYearComponent implements OnInit, OnChanges, OnDestroy {

  constructor(private flashMessage: FlashMessageService, private helper: HelperService, private dataService: EsvDataService) { }

  @Input() selectedDate: string = ""
  @Input() monthStats: Array<MonthStats> = new Array
  @Input() yearAvgList: Array<YearAvg> = new Array

  sortedMonthStats: Array<MonthStats | undefined> = new Array
  chosenYear: string = ""
  chosenYearSum: YearSum | undefined
  chosenyearAvgs: Array<YearAvg> = new Array

  helperArray: any = new Array(12)  // Dient der *ngFor-Schleife im html als Parameter
  
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
  }

  /**
   * Unsubscribed alle Subscriptions
   */
  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  /**
   * Lädt die Daten für die Tabelle wenn sich das Datum ändert
   * @param changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    this.chosenYear = this.helper.getYearString(this.selectedDate)
    this.sortedMonthStats = this.helper.sortAndGroupByMonth(this.monthStats)
    const subscription = this.dataService.getSpecificYearSum(this.chosenYear).subscribe(response => {
      if (!response.success) this.flashMessage.show(response.msg, { cssClass: 'alert-danger', timeout: 5000 })
      this.chosenYearSum = response.data
    })
    
    const selectedYears = [this.helper.getYearString(this.selectedDate),
    (parseInt(this.helper.getYearString(this.selectedDate)) - 1).toString(),
    (parseInt(this.helper.getYearString(this.selectedDate)) - 2).toString()]
    this.chosenyearAvgs = this.helper.returnListOfChosenYears(selectedYears, this.yearAvgList);

    this.subscriptions.push(subscription);
  }

  // Helper-Methoden für die HTML
  addNumbers(numbers: (number | undefined | null)[]) { return this.helper.addNumbers(numbers) }
  parseInteger(val: string) { return parseInt(val) }
  round(val: number) { return this.helper.round(val) }

  // Funktion um die aktuelle Tabelle auszudrucken
  async print(): Promise<void> {
    const response = await fetch("https://bootswatch.com/5/flatly/bootstrap.min.css");
    const cssText = await response.text();
    const cssFile = require('./esv-year.component.css').toString();

    const printWindow = window.open('', '', 'height=800,width=1200');

    if (printWindow) {
      const tableToPrint = document.getElementById("printYearRep");

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


