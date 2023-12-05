import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Invoice } from 'src/client/app/models/invoice.model';
import { IronReport, SteelReport } from 'src/client/app/models/report.model';
import { HelperService } from 'src/client/app/services/helperServices/helper.service';

@Component({
  selector: 'app-rechnung-a-stahl',
  templateUrl: './rechnung-a-stahl.component.html',
  styleUrls: ['./rechnung-a-stahl.component.css']
})
export class RechnungAStahlComponent implements OnInit, OnChanges {

  @Input() reportInvoice: Invoice | undefined;

  today: String = new Date().toLocaleDateString();

  constructor(private helper: HelperService) { }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    console.log(this.reportInvoice);
  }

  convertToSteelReport(report: IronReport | SteelReport | undefined): SteelReport {
    return report as SteelReport;
  }

  addNumbers(numbers: (number | undefined)[]) { return this.helper.addNumbers(numbers)};
  writeAsEuro(value: number){return this.helper.writeNumberAsEuro(value)}

  // Funktion um die aktuelle Tabelle auszudrucken
  async print(): Promise<void> {
    const response = await fetch("https://bootswatch.com/5/flatly/bootstrap.min.css");
    const cssText = await response.text();
    const cssFile = require('./rechnung-a-stahl.component.css').toString();

    const printWindow = window.open('', '', 'height=800,width=1200');

    if (printWindow) {
      const tableToPrint = document.getElementById("printSteelA");

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
