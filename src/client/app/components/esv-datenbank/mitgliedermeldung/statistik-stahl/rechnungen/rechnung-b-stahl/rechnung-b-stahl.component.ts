import { Component, Input, OnInit } from '@angular/core';
import { Invoice } from 'src/client/app/models/invoice.model';
import { HelperService } from 'src/client/app/services/helperServices/helper.service';

@Component({
  selector: 'app-rechnung-b-stahl',
  templateUrl: './rechnung-b-stahl.component.html',
  styleUrls: ['./rechnung-b-stahl.component.css']
})
export class RechnungBStahlComponent implements OnInit {

  @Input() reportInvoice: Invoice | undefined;

  grundbeitrag: boolean = true;
  reportSum = "0,00€";

  defaultIBAN_1 = "Commerzbank AG, D'dorf, BIC-Code: COBADEFFXXX, IBAN: DE86 3004 0000 0645 5588 00";
  defaultIBAN_2 = "Deutsche Bank AG, D'dorf, BIC-Code: DEUTDEDDXXX, IBAN: DE61 3007 0010 0748 0650 00";
  today: string = new Date().toLocaleDateString();
  
  constructor(private helper: HelperService) { }

  ngOnInit(): void {
    this.calculateGrundbeitrag();
  }

  onGrundbeitragChange(value: boolean) {
    this.grundbeitrag = value;
    this.calculateGrundbeitrag();
    this.calculateGrundbeitrag();
  }

  calculateGrundbeitrag() {
    if(this.grundbeitrag == true){
      this.reportSum = this.helper.writeNumberAsEuro(this.reportInvoice!.inland_bill + this.reportInvoice!.export_bill + 200);
    } else {
      this.reportSum = this.helper.writeNumberAsEuro(this.reportInvoice!.inland_bill + this.reportInvoice!.export_bill);
    }
  }
  
  getWrittenMonth(date?: string) {return this.helper.getMonthString(date)}
  getWrittenYear(date?: string) {return this.helper.getYearString(date)}
  writeAsEuro(value: number){return this.helper.writeNumberAsEuro(value)}
  addNumbers(numbers: (number | undefined)[]) { return this.helper.addNumbers(numbers)};

  // Funktion um die aktuelle Tabelle auszudrucken
  async print(): Promise<void> {
    const response = await fetch("https://bootswatch.com/5/flatly/bootstrap.min.css");
    const cssText = await response.text();
    const cssFile = require('./rechnung-b-stahl.component.css').toString();

    const printWindow = window.open('', '', 'height=800,width=1200');

    if (printWindow) {
      const tableToPrint = document.getElementById("printSteelB");

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
