import { Component, Input, OnInit } from '@angular/core';
import { SummarizedIronReport } from 'src/client/app/models/report.model';
import { HelperService } from 'src/client/app/services/helperServices/helper.service';

@Component({
  selector: 'app-eisen-div-quartal',
  templateUrl: './eisen-div-quartal.component.html',
  styleUrls: ['./eisen-div-quartal.component.css']
})
export class EisenDivQuartalComponent implements OnInit {

  constructor( private helper: HelperService ) { }

  @Input() selectedDate: string = this.helper.getCurrentDateString();
  @Input() ironReportQuarterSum: SummarizedIronReport[] = [];

  ngOnInit(): void {
  }

  // Funktion um die aktuelle Tabelle auszudrucken
  async print(): Promise<void> {
    const response = await fetch("https://bootswatch.com/5/flatly/bootstrap.min.css");
    const cssText = await response.text();
    const cssFile = require('./eisen-div-quartal.component.css').toString();

    const printWindow = window.open('', '', 'height=800,width=1200');

    if (printWindow) {
      const tableToPrint = document.getElementById("printIronDivergenzQuarter");

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

  // Helper funktionen fürs HTML
  getWrittenMonth(date: string) {return this.helper.getMonthString(date)};
  getWrittenYear(date: string) {return this.helper.getYearString(date)};
  getWrittenLastYear(date: string) {return "" + (parseInt(this.helper.getYearString(date))-1)};
  parseInteger(value: string) {return parseInt(value)};
  addNumbers(numbers: (number | undefined)[]) { return this.helper.addNumbers(numbers)};
  getWrittenQuartal(date: string) {return this.helper.getQuarterString(date)};
}
