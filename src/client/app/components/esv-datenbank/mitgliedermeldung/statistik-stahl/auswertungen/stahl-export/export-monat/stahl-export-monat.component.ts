import { Component, OnDestroy, OnInit } from '@angular/core';
import { SteelReport, ExportList } from 'src/client/app/models/report.model';
import { EsvCountryService } from 'src/client/app/services/esvImportServices/esvCountry.service';
import { ReportService } from 'src/client/app/services/esvStatistikServices/report.service';
import { HelperService } from 'src/client/app/services/helperServices/helper.service';
import { Subscription } from 'rxjs';
import { Country } from 'src/client/app/models/country.model';
import { FlashMessageService } from 'src/client/app/services/flashMessageServices/flash-message.service';

@Component({
  selector: 'app-stahl-export-monat',
  templateUrl: './stahl-export-monat.component.html',
  styleUrls: ['./stahl-export-monat.component.css']
})
export class StahlExportMonatComponent implements OnInit, OnDestroy {

  selectedDate: string = this.helper.getCurrentDateString();
  reports: SteelReport[] = [];
  countries: Country[] = [];
  exportList: ExportList[] = [];

  private subscriptions: Subscription[] = [];

  constructor(private reportService: ReportService, private flashMessage: FlashMessageService, private helper: HelperService, private countrieService: EsvCountryService) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  setDate(event: Event) {
    this.selectedDate = (event.target as HTMLInputElement).value;

    // Load Reports
    let subscription: Subscription = this.reportService.getSteelReportsByDate(this.helper.normDate(this.selectedDate)).subscribe(data => {
      this.subscriptions.push(subscription);
      if (!data.success) return this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 5000 });
      else {
        this.reports = data.reportList;
        // Load Countries
        subscription = this.countrieService.getListOfCountries("all").subscribe(data => {
          if (!data.success) return this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 5000 });
          else {
            this.countries = data.countryList;

            // Calculate Export List
            this.calculateExportList();
          }
        });
        this.subscriptions.push(subscription);
      }
    });
  }

  calculateExportList() {
    if (this.reports.length > 0) {
      let exportList: Array<ExportList> = [];

      for (let report of this.reports) {
        for (let exportReport of report.country_exports) {
          let country = this.countries.find(country => country.countryID === exportReport.countryID);
          if (country) {
            exportList.push({
              companyID: report.companyID,
              amount: exportReport.amount,
              country: country
            });
          }
        }
      }

      this.exportList = exportList;
    }
  }

  sumOfCountries(countryCategory: String) {
    let sum = 0

    if (countryCategory == "Gesamt") {
      this.exportList.forEach(exportList => {
        sum += exportList.amount
      })

    } else {
      this.exportList.forEach(exportList => {
        if ((exportList.country.continent == countryCategory && !exportList.country.isEU && !exportList.country.isEFTA)
          || (exportList.country.continent == "Europa" && countryCategory == "EU" && exportList.country.isEU)
          || (exportList.country.continent == "Europa" && countryCategory == "EFTA" && exportList.country.isEFTA)) {
          sum += exportList.amount
        }
      })
    }
    return this.helper.round(sum)
  }

  // Funktion um die aktuelle Tabelle auszudrucken
  async print(): Promise<void> {
    const response = await fetch("https://bootswatch.com/5/flatly/bootstrap.min.css");
    const cssText = await response.text();
    const cssFile = require('./stahl-export-monat.component.css').toString();

    const printWindow = window.open('', '', 'height=800,width=1200');

    if (printWindow) {
      const tableToPrint = document.getElementById("printSteelMonthView");

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
