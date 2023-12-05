import { Component, OnDestroy, OnInit } from '@angular/core';
import { ExportReport, SteelReport } from 'src/client/app/models/report.model';
import { EsvCountryService } from 'src/client/app/services/esvImportServices/esvCountry.service';
import { ReportService } from 'src/client/app/services/esvStatistikServices/report.service';
import { Subscription } from 'rxjs';
import { Country } from 'src/client/app/models/country.model';
import { FlashMessageService } from 'src/client/app/services/flashMessageServices/flash-message.service';

@Component({
  selector: 'app-stahl-export-gesamt',
  templateUrl: './stahl-export-gesamt.component.html',
  styleUrls: ['./stahl-export-gesamt.component.css']
})
export class StahlExportGesamtComponent implements OnInit, OnDestroy {

  constructor(private flashMessage: FlashMessageService, private reportService: ReportService, private countryService: EsvCountryService) { }

  listOfExportsQ1: Array<ExportReport> = [];
  listOfExportsQ2: Array<ExportReport> = [];
  listOfExportsQ3: Array<ExportReport> = [];
  listOfExportsQ4: Array<ExportReport> = [];

  listOfSteelReportsSelectedYear: Array<SteelReport> = [];

  listOfYears: Array<string> = [];
  selectedYear: string = "";

  listOfCountries: Array<Country> = [];
  listOfCountriesEU: Array<Country> = [];
  listOfCountriesEFTA: Array<Country> = [];
  listOfCountriesEUROPE: Array<Country> = [];
  listOfCountriesAFRICA: Array<Country> = [];
  listOfCountriesNORTHAMERICA: Array<Country> = [];
  listOfCountriesSOUTHAMERICA: Array<Country> = [];
  listOfCountriesASIA: Array<Country> = [];
  listOfCountriesOCEANIA: Array<Country> = [];
  listOfCountriesANTARCTICA: Array<Country> = [];

  // Q1, Q2, Q3, Q4, Total
  sumsEU: number[] = [0, 0, 0, 0, 0];
  sumsEFTA: number[] = [0, 0, 0, 0, 0];
  sumsEUROPE: number[] = [0, 0, 0, 0, 0];
  sumsAFRICA: number[] = [0, 0, 0, 0, 0];
  sumsNORTHAMERICA: number[] = [0, 0, 0, 0, 0];
  sumsSOUTHAMERICA: number[] = [0, 0, 0, 0, 0];
  sumsASIA: number[] = [0, 0, 0, 0, 0];
  sumsOCEANIA: number[] = [0, 0, 0, 0, 0];
  sumsANTARCTICA: number[] = [0, 0, 0, 0, 0];

  percentageEU: number = 0;
  percentageEFTA: number = 0;
  percentageEUROPE: number = 0;
  percentageAFRICA: number = 0;
  percentageNORTHAMERICA: number = 0;
  percentageSOUTHAMERICA: number = 0;
  percentageASIA: number = 0;
  percentageOCEANIA: number = 0;
  percentageANTARCTICA: number = 0;

  countryMap: Map<string, number> = new Map();
  continentMap: Map<string, string> = new Map();

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.getListOfCountries();
    this.loadYears();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  loadYears() {
    const subscription = this.reportService.getSteelReportDates().subscribe((data) => {
      if (!data.success) {
        this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 5000 });
      }
      const currentDate: Date = new Date();
      const currentYear: string = currentDate.getFullYear().toString();
      let yearAsNumber: number = parseInt(data.reportList[0].reportDate.substring(0, 4))
      while (yearAsNumber.toString() != currentYear) {
        this.listOfYears.unshift(yearAsNumber.toString());
        yearAsNumber++;
      }
      this.listOfYears.unshift(yearAsNumber.toString());
    })
  }

  onSelect(): void {
    if (this.selectedYear != "") {
      const subscription = this.reportService.getSteelReportsByYear(this.selectedYear).subscribe((data) => {
        if (!data.success) {
          this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 5000 });
        }
        this.listOfSteelReportsSelectedYear = data.reportList;
        this.updateExports();
      })
    }
  }

  getCountryExportArraysFromQuartal(quartal: number): Array<ExportReport> {
    let exports = [];
    let j = 0;
    for (let i = 0; i < this.listOfSteelReportsSelectedYear.length; i++) {
      if (this.listOfSteelReportsSelectedYear[i].country_exports[0] != undefined) {
        for (let l = 0; l < this.listOfSteelReportsSelectedYear[i].country_exports.length; l++) {
          if (this.getReportDateQuartal(this.listOfSteelReportsSelectedYear[i].reportDate) == quartal) {
            exports[j] = this.listOfSteelReportsSelectedYear[i].country_exports[l];
            j++;
          }
        }
      }
    }
    return exports;
  }

  getReportDateQuartal(reportDate: string): number {
    let month = reportDate.substring(5, 7);
    if (month == "01" || month == "02" || month == "03") {
      return 1;
    } else if (month == "04" || month == "05" || month == "06") {
      return 2;
    } else if (month == "07" || month == "08" || month == "09") {
      return 3;
    } else {
      return 4;
    }
  }

  getListOfCountries() {
    let mapIndex = 0;
    let subscription: Subscription = this.countryService.getListOfCountries("Europa").subscribe((data) => {
      if (!data.success) {
        this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 5000 });
      }
      for (let i = 0; i < data.countryList.length; i++) {
        this.countryMap.set(data.countryList[i].countryID.toString(), mapIndex);
        mapIndex++;
        if (data.countryList[i].isEFTA) {
          this.listOfCountriesEFTA.push(data.countryList[i]);
          this.continentMap.set(data.countryList[i].countryID.toString(), "EFTA");
        } else if (data.countryList[i].isEU) {
          this.listOfCountriesEU.push(data.countryList[i]);
          this.continentMap.set(data.countryList[i].countryID.toString(), "EU");
        } else {
          this.listOfCountriesEUROPE.push(data.countryList[i]);
          this.continentMap.set(data.countryList[i].countryID.toString(), "EUROPE");
        }
      }
    });
    this.subscriptions.push(subscription);

    subscription = this.countryService.getListOfCountries("Asien").subscribe((data) => {
      if (!data.success) {
        this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 5000 });
      }
      for (let i = 0; i < data.countryList.length; i++) {
        this.countryMap.set(data.countryList[i].countryID.toString(), mapIndex);
        mapIndex++;
        this.continentMap.set(data.countryList[i].countryID.toString(), "ASIA");
      }
      this.listOfCountriesASIA = data.countryList
    })
    this.subscriptions.push(subscription);

    subscription = this.countryService.getListOfCountries("Nordamerika").subscribe((data) => {
      if (!data.success) {
        this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 5000 });
      }
      for (let i = 0; i < data.countryList.length; i++) {
        this.countryMap.set(data.countryList[i].countryID.toString(), mapIndex);
        mapIndex++;
        this.continentMap.set(data.countryList[i].countryID.toString(), "NORTHAMERICA");
      }
      this.listOfCountriesNORTHAMERICA = data.countryList
    })
    this.subscriptions.push(subscription);

    subscription = this.countryService.getListOfCountries("Südamerika").subscribe((data) => {
      if (!data.success) {
        this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 5000 });
      }
      for (let i = 0; i < data.countryList.length; i++) {
        this.countryMap.set(data.countryList[i].countryID.toString(), mapIndex);
        mapIndex++;
        this.continentMap.set(data.countryList[i].countryID.toString(), "SOUTHAMERICA");
      }
      this.listOfCountriesSOUTHAMERICA = data.countryList
    })
    this.subscriptions.push(subscription);

    subscription = this.countryService.getListOfCountries("Ozeanien").subscribe((data) => {
      if (!data.success) {
        this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 5000 });
      }
      for (let i = 0; i < data.countryList.length; i++) {
        this.countryMap.set(data.countryList[i].countryID.toString(), mapIndex);
        mapIndex++;
        this.continentMap.set(data.countryList[i].countryID.toString(), "OCEANIA");
      }
      this.listOfCountriesOCEANIA = data.countryList
    })
    this.subscriptions.push(subscription);

    subscription = this.countryService.getListOfCountries("Antarktis").subscribe((data) => {
      if (!data.success) {
        this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 5000 });
      }
      for (let i = 0; i < data.countryList.length; i++) {
        this.countryMap.set(data.countryList[i].countryID.toString(), mapIndex);
        mapIndex++;
        this.continentMap.set(data.countryList[i].countryID.toString(), "ANTARCTICA");
      }
      this.listOfCountriesANTARCTICA = data.countryList
    })
    this.subscriptions.push(subscription);

    subscription = this.countryService.getListOfCountries("Afrika").subscribe((data) => {
      if (!data.success) {
        this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 5000 });
      }
      for (let i = 0; i < data.countryList.length; i++) {
        this.countryMap.set(data.countryList[i].countryID.toString(), mapIndex);
        mapIndex++;
        this.continentMap.set(data.countryList[i].countryID.toString(), "AFRICA");
      }
      this.listOfCountriesAFRICA = data.countryList
    })
    this.subscriptions.push(subscription);

  }

  updateExports() {

    this.sumsAFRICA = [0, 0, 0, 0, 0];
    this.sumsASIA = [0, 0, 0, 0, 0];
    this.sumsEU = [0, 0, 0, 0, 0];
    this.sumsEFTA = [0, 0, 0, 0, 0];
    this.sumsEUROPE = [0, 0, 0, 0, 0];
    this.sumsNORTHAMERICA = [0, 0, 0, 0, 0];
    this.sumsSOUTHAMERICA = [0, 0, 0, 0, 0];
    this.sumsOCEANIA = [0, 0, 0, 0, 0];
    this.sumsANTARCTICA = [0, 0, 0, 0, 0];

    let sumsQ1: number[] = [];
    let sumsQ2: number[] = [];
    let sumsQ3: number[] = [];
    let sumsQ4: number[] = [];
    let sumsTotal: number[] = [];

    this.listOfExportsQ1 = this.getCountryExportArraysFromQuartal(1);
    this.listOfExportsQ2 = this.getCountryExportArraysFromQuartal(2);
    this.listOfExportsQ3 = this.getCountryExportArraysFromQuartal(3);
    this.listOfExportsQ4 = this.getCountryExportArraysFromQuartal(4);

    for (let i = 0; i < this.listOfExportsQ1.length; i++) {
      let index = this.countryMap.get(this.listOfExportsQ1[i].countryID)!;
      if (sumsQ1[index] == undefined) {
        sumsQ1[index] = 0;
      }
      if (sumsTotal[index] == undefined) {
        sumsTotal[index] = 0;
      }
      sumsQ1[index] += this.listOfExportsQ1[i].amount
      sumsTotal[index] += this.listOfExportsQ1[i].amount
      this.addToContinentSum(this.listOfExportsQ1[i].countryID, 1, this.listOfExportsQ1[i].amount);
      this.addToContinentSum(this.listOfExportsQ1[i].countryID, 5, this.listOfExportsQ1[i].amount);
    }
    for (let i = 0; i < this.listOfExportsQ2.length; i++) {
      let index = this.countryMap.get(this.listOfExportsQ2[i].countryID)!;
      if (sumsQ2[index] == undefined) {
        sumsQ2[index] = 0;
      }
      if (sumsTotal[index] == undefined) {
        sumsTotal[index] = 0;
      }
      sumsQ2[index] += this.listOfExportsQ2[i].amount
      sumsTotal[index] += this.listOfExportsQ2[i].amount
      this.addToContinentSum(this.listOfExportsQ2[i].countryID, 2, this.listOfExportsQ2[i].amount);
      this.addToContinentSum(this.listOfExportsQ2[i].countryID, 5, this.listOfExportsQ2[i].amount);
    }
    for (let i = 0; i < this.listOfExportsQ3.length; i++) {
      let index = this.countryMap.get(this.listOfExportsQ3[i].countryID)!;
      if (sumsQ3[index] == undefined) {
        sumsQ3[index] = 0;
      }
      if (sumsTotal[index] == undefined) {
        sumsTotal[index] = 0;
      }
      sumsQ3[index] += this.listOfExportsQ3[i].amount
      sumsTotal[index] += this.listOfExportsQ3[i].amount
      this.addToContinentSum(this.listOfExportsQ3[i].countryID, 3, this.listOfExportsQ3[i].amount);
      this.addToContinentSum(this.listOfExportsQ3[i].countryID, 5, this.listOfExportsQ3[i].amount);
    }
    for (let i = 0; i < this.listOfExportsQ4.length; i++) {
      let index = this.countryMap.get(this.listOfExportsQ4[i].countryID)!;
      if (sumsQ4[index] == undefined) {
        sumsQ4[index] = 0;
      }
      if (sumsTotal[index] == undefined) {
        sumsTotal[index] = 0;
      }
      sumsQ4[index] += this.listOfExportsQ4[i].amount
      sumsTotal[index] += this.listOfExportsQ4[i].amount
      this.addToContinentSum(this.listOfExportsQ4[i].countryID, 4, this.listOfExportsQ4[i].amount);
      this.addToContinentSum(this.listOfExportsQ4[i].countryID, 5, this.listOfExportsQ4[i].amount);
    }

    this.countryMap.forEach((value: number, key: string) => {
      if (sumsQ1[value] != undefined) {
        document.getElementById(key + "Q1")!.innerHTML = sumsQ1[value].toString();
      } else {
        document.getElementById(key + "Q1")!.innerHTML = "0";
      }
      if (sumsQ2[value] != undefined) {
        document.getElementById(key + "Q2")!.innerHTML = sumsQ2[value].toString();
      } else {
        document.getElementById(key + "Q2")!.innerHTML = "0";
      }
      if (sumsQ3[value] != undefined) {
        document.getElementById(key + "Q3")!.innerHTML = sumsQ3[value].toString();
      } else {
        document.getElementById(key + "Q3")!.innerHTML = "0";
      }
      if (sumsQ4[value] != undefined) {
        document.getElementById(key + "Q4")!.innerHTML = sumsQ4[value].toString();
      } else {
        document.getElementById(key + "Q4")!.innerHTML = "0";
      }
      if (sumsTotal[value] != undefined) {
        document.getElementById(key + "GES")!.innerHTML = sumsTotal[value].toString();
      } else {
        document.getElementById(key + "GES")!.innerHTML = "0";
      }
    });

    this.percentageAFRICA = 0;
    this.percentageANTARCTICA = 0;
    this.percentageASIA = 0;
    this.percentageEFTA = 0;
    this.percentageEU = 0;
    this.percentageEUROPE = 0;
    this.percentageNORTHAMERICA = 0;
    this.percentageOCEANIA = 0;
    this.percentageSOUTHAMERICA = 0;

    let total = this.sumsAFRICA[4] + this.sumsANTARCTICA[4] + this.sumsASIA[4]
      + this.sumsEFTA[4] + this.sumsEU[4] + this.sumsEUROPE[4]
      + this.sumsNORTHAMERICA[4] + this.sumsOCEANIA[4] + this.sumsSOUTHAMERICA[4];

    if (total != 0) {
      this.percentageAFRICA = parseFloat(((this.sumsAFRICA[4] / total) * 100).toFixed(3));
      this.percentageANTARCTICA = parseFloat(((this.sumsANTARCTICA[4] / total) * 100).toFixed(3));
      this.percentageASIA = parseFloat(((this.sumsASIA[4] / total) * 100).toFixed(3));
      this.percentageEFTA = parseFloat(((this.sumsEFTA[4] / total) * 100).toFixed(3));
      this.percentageEU = parseFloat(((this.sumsEU[4] / total) * 100).toFixed(3));
      this.percentageEUROPE = parseFloat(((this.sumsEUROPE[4] / total) * 100).toFixed(3));
      this.percentageNORTHAMERICA = parseFloat(((this.sumsNORTHAMERICA[4] / total) * 100).toFixed(3));
      this.percentageOCEANIA = parseFloat(((this.sumsOCEANIA[4] / total) * 100).toFixed(3));
      this.percentageSOUTHAMERICA = parseFloat(((this.sumsSOUTHAMERICA[4] / total) * 100).toFixed(3));
    }
  }

  addToContinentSum(countryID: string, quartal: number, amount: number): void {
    if (this.continentMap.get(countryID) == "EU") {
      this.sumsEU[quartal - 1] += amount;
    }
    if (this.continentMap.get(countryID) == "EFTA") {
      this.sumsEFTA[quartal - 1] += amount;
    }
    if (this.continentMap.get(countryID) == "EUROPE") {
      this.sumsEUROPE[quartal - 1] += amount;
    }
    if (this.continentMap.get(countryID) == "ASIA") {
      this.sumsASIA[quartal - 1] += amount;
    }
    if (this.continentMap.get(countryID) == "AFRICA") {
      this.sumsAFRICA[quartal - 1] += amount;
    }
    if (this.continentMap.get(countryID) == "NORTHAMERICA") {
      this.sumsNORTHAMERICA[quartal - 1] += amount;
    }
    if (this.continentMap.get(countryID) == "SOUTHAMERICA") {
      this.sumsSOUTHAMERICA[quartal - 1] += amount;
    }
    if (this.continentMap.get(countryID) == "ANTARCTICA") {
      this.sumsANTARCTICA[quartal - 1] += amount;
    }
    if (this.continentMap.get(countryID) == "OCEANIA") {
      this.sumsOCEANIA[quartal - 1] += amount;
    }
  }

  // Funktion um die aktuelle Tabelle auszudrucken
  async print(): Promise<void> {
    const response = await fetch("https://bootswatch.com/5/flatly/bootstrap.min.css");
    const cssText = await response.text();
    const cssFile = require('./stahl-export-gesamt.component.css').toString();

    const printWindow = window.open('', '', 'height=800,width=1200');

    if (printWindow) {
      const tableToPrint = document.getElementById("printSteelQuartalTotal");

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
