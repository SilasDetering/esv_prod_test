import { Component, OnDestroy, OnInit } from '@angular/core';
import { ExportReport, SteelReport } from 'src/client/app/models/report.model';
import { EsvCountryService } from 'src/client/app/services/esvImportServices/esvCountry.service';
import { ReportService } from 'src/client/app/services/esvStatistikServices/report.service';
import { Subscription } from 'rxjs';
import { Country } from 'src/client/app/models/country.model';
import { FlashMessageService } from 'src/client/app/services/flashMessageServices/flash-message.service';

@Component({
  selector: 'app-stahl-export-quartal',
  templateUrl: './stahl-export-quartal.component.html',
  styleUrls: ['./stahl-export-quartal.component.css']
})
export class StahlExportQuartalComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];

  constructor(private flashMessage: FlashMessageService, private reportService: ReportService, private countryService: EsvCountryService) { }

  listOfExportsFIRST: Array<ExportReport> = [];
  listOfExportsSECOND: Array<ExportReport> = [];
  listOfExportsTHIRD: Array<ExportReport> = [];

  listOfSteelReportsSelectedYear: Array<SteelReport> = [];

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

  // FIRST, SECOND, THIRD, Total
  sumsEU: number[] = [0, 0, 0, 0];
  sumsEFTA: number[] = [0, 0, 0, 0];
  sumsEUROPE: number[] = [0, 0, 0, 0];
  sumsAFRICA: number[] = [0, 0, 0, 0];
  sumsNORTHAMERICA: number[] = [0, 0, 0, 0];
  sumsSOUTHAMERICA: number[] = [0, 0, 0, 0];
  sumsASIA: number[] = [0, 0, 0, 0];
  sumsOCEANIA: number[] = [0, 0, 0, 0];
  sumsANTARCTICA: number[] = [0, 0, 0, 0];

  percentageEU: number = 0;
  percentageEFTA: number = 0;
  percentageEUROPE: number = 0;
  percentageAFRICA: number = 0;
  percentageNORTHAMERICA: number = 0;
  percentageSOUTHAMERICA: number = 0;
  percentageASIA: number = 0;
  percentageOCEANIA: number = 0;
  percentageANTARCTICA: number = 0;

  listOfYears: string[] = [];

  selectedQuartal: string = "";
  selectedYear: string = "";

  countryMap: Map<string, number> = new Map();
  continentMap: Map<string, string> = new Map();

  ngOnInit(): void {
    this.loadYears();
    this.getListOfCountries();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onSelect(): void {
    if (this.selectedQuartal != "" && this.selectedYear != "") {
      const subscription = this.reportService.getSteelReportsByYear(this.selectedYear).subscribe((data) => {
        if (!data.success) {
          this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 5000 });
        }
        this.listOfSteelReportsSelectedYear = data.reportList;
        this.updateExports();
      })
      this.subscriptions.push(subscription);
    }
  }

  loadYears(): void {
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
    this.subscriptions.push(subscription);
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
    });
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
    });
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
    });
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
    });
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
    });
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
    });
    this.subscriptions.push(subscription);

  }

  getCountryExportArraysFromMonth(month: number): Array<ExportReport> {
    let exports = [];
    let j = 0;
    for (let i = 0; i < this.listOfSteelReportsSelectedYear.length; i++) {
      if (this.listOfSteelReportsSelectedYear[i].country_exports[0] != undefined) {
        for (let l = 0; l < this.listOfSteelReportsSelectedYear[i].country_exports.length; l++) {
          if (this.getReportDateMonth(this.listOfSteelReportsSelectedYear[i].reportDate) == month) {
            exports[j] = this.listOfSteelReportsSelectedYear[i].country_exports[l];
            j++;
          }
        }
      }
    }
    return exports;
  }

  getReportDateMonth(reportDate: string): number {
    let month = reportDate.substring(5, 7);
    return parseInt(month);
  }

  updateExports(): void {
    this.sumsAFRICA = [0, 0, 0, 0];
    this.sumsASIA = [0, 0, 0, 0];
    this.sumsEU = [0, 0, 0, 0];
    this.sumsEFTA = [0, 0, 0, 0];
    this.sumsEUROPE = [0, 0, 0, 0];
    this.sumsNORTHAMERICA = [0, 0, 0, 0];
    this.sumsSOUTHAMERICA = [0, 0, 0, 0];
    this.sumsOCEANIA = [0, 0, 0, 0];
    this.sumsANTARCTICA = [0, 0, 0, 0];

    let sumsFIRST: number[] = [];
    let sumsSECOND: number[] = [];
    let sumsTHIRD: number[] = [];
    let sumsTOTAL: number[] = [];

    if (this.selectedQuartal == "1. Quartal") {
      this.listOfExportsFIRST = this.getCountryExportArraysFromMonth(1);
      this.listOfExportsSECOND = this.getCountryExportArraysFromMonth(2);
      this.listOfExportsTHIRD = this.getCountryExportArraysFromMonth(3);
    } else if (this.selectedQuartal == "2. Quartal") {
      this.listOfExportsFIRST = this.getCountryExportArraysFromMonth(4);
      this.listOfExportsSECOND = this.getCountryExportArraysFromMonth(5);
      this.listOfExportsTHIRD = this.getCountryExportArraysFromMonth(6);
    } else if (this.selectedQuartal == "3. Quartal") {
      this.listOfExportsFIRST = this.getCountryExportArraysFromMonth(7);
      this.listOfExportsSECOND = this.getCountryExportArraysFromMonth(8);
      this.listOfExportsTHIRD = this.getCountryExportArraysFromMonth(9);
    } else if (this.selectedQuartal == "4. Quartal") {
      this.listOfExportsFIRST = this.getCountryExportArraysFromMonth(10);
      this.listOfExportsSECOND = this.getCountryExportArraysFromMonth(11);
      this.listOfExportsTHIRD = this.getCountryExportArraysFromMonth(12);
    }

    for (let i = 0; i < this.listOfExportsFIRST.length; i++) {
      let index = this.countryMap.get(this.listOfExportsFIRST[i].countryID)!;
      if (sumsFIRST[index] == undefined) {
        sumsFIRST[index] = 0;
      }
      if (sumsTOTAL[index] == undefined) {
        sumsTOTAL[index] = 0;
      }
      sumsFIRST[index] += this.listOfExportsFIRST[i].amount
      sumsTOTAL[index] += this.listOfExportsFIRST[i].amount
      this.addToContinentSum(this.listOfExportsFIRST[i].countryID, 1, this.listOfExportsFIRST[i].amount);
      this.addToContinentSum(this.listOfExportsFIRST[i].countryID, 4, this.listOfExportsFIRST[i].amount);
    }
    for (let i = 0; i < this.listOfExportsSECOND.length; i++) {
      let index = this.countryMap.get(this.listOfExportsSECOND[i].countryID)!;
      if (sumsSECOND[index] == undefined) {
        sumsSECOND[index] = 0;
      }
      if (sumsTOTAL[index] == undefined) {
        sumsTOTAL[index] = 0;
      }
      sumsSECOND[index] += this.listOfExportsSECOND[i].amount
      sumsTOTAL[index] += this.listOfExportsSECOND[i].amount
      this.addToContinentSum(this.listOfExportsSECOND[i].countryID, 2, this.listOfExportsSECOND[i].amount);
      this.addToContinentSum(this.listOfExportsSECOND[i].countryID, 4, this.listOfExportsSECOND[i].amount);
    }
    for (let i = 0; i < this.listOfExportsTHIRD.length; i++) {
      let index = this.countryMap.get(this.listOfExportsTHIRD[i].countryID)!;
      if (sumsTHIRD[index] == undefined) {
        sumsTHIRD[index] = 0;
      }
      if (sumsTOTAL[index] == undefined) {
        sumsTOTAL[index] = 0;
      }
      sumsTHIRD[index] += this.listOfExportsTHIRD[i].amount
      sumsTOTAL[index] += this.listOfExportsTHIRD[i].amount
      this.addToContinentSum(this.listOfExportsTHIRD[i].countryID, 3, this.listOfExportsTHIRD[i].amount);
      this.addToContinentSum(this.listOfExportsTHIRD[i].countryID, 4, this.listOfExportsTHIRD[i].amount);
    }

    this.countryMap.forEach((value: number, key: string) => {
      if (sumsFIRST[value] != undefined) {
        document.getElementById(key + "FIRST")!.innerHTML = sumsFIRST[value].toString();
      } else {
        document.getElementById(key + "FIRST")!.innerHTML = "0";
      }
      if (sumsSECOND[value] != undefined) {
        document.getElementById(key + "SECOND")!.innerHTML = sumsSECOND[value].toString();
      } else {
        document.getElementById(key + "SECOND")!.innerHTML = "0";
      }
      if (sumsTHIRD[value] != undefined) {
        document.getElementById(key + "THIRD")!.innerHTML = sumsTHIRD[value].toString();
      } else {
        document.getElementById(key + "THIRD")!.innerHTML = "0";
      }
      if (sumsTOTAL[value] != undefined) {
        document.getElementById(key + "GES")!.innerHTML = sumsTOTAL[value].toString();
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

    let total = this.sumsAFRICA[3] + this.sumsANTARCTICA[3] + this.sumsASIA[3]
      + this.sumsEFTA[3] + this.sumsEU[3] + this.sumsEUROPE[3]
      + this.sumsNORTHAMERICA[3] + this.sumsOCEANIA[3] + this.sumsSOUTHAMERICA[3];

    if (total != 0) {
      this.percentageAFRICA = parseFloat(((this.sumsAFRICA[3] / total) * 100).toFixed(3));
      this.percentageANTARCTICA = parseFloat(((this.sumsANTARCTICA[3] / total) * 100).toFixed(3));
      this.percentageASIA = parseFloat(((this.sumsASIA[3] / total) * 100).toFixed(3));
      this.percentageEFTA = parseFloat(((this.sumsEFTA[3] / total) * 100).toFixed(3));
      this.percentageEU = parseFloat(((this.sumsEU[3] / total) * 100).toFixed(3));
      this.percentageEUROPE = parseFloat(((this.sumsEUROPE[3] / total) * 100).toFixed(3));
      this.percentageNORTHAMERICA = parseFloat(((this.sumsNORTHAMERICA[3] / total) * 100).toFixed(3));
      this.percentageOCEANIA = parseFloat(((this.sumsOCEANIA[3] / total) * 100).toFixed(3));
      this.percentageSOUTHAMERICA = parseFloat(((this.sumsSOUTHAMERICA[3] / total) * 100).toFixed(3));
    }
  }

  addToContinentSum(countryID: string, month: number, amount: number): void {
    if (this.continentMap.get(countryID) == "EU") {
      this.sumsEU[month - 1] += amount;
    }
    if (this.continentMap.get(countryID) == "EFTA") {
      this.sumsEFTA[month - 1] += amount;
    }
    if (this.continentMap.get(countryID) == "EUROPE") {
      this.sumsEUROPE[month - 1] += amount;
    }
    if (this.continentMap.get(countryID) == "ASIA") {
      this.sumsASIA[month - 1] += amount;
    }
    if (this.continentMap.get(countryID) == "AFRICA") {
      this.sumsAFRICA[month - 1] += amount;
    }
    if (this.continentMap.get(countryID) == "NORTHAMERICA") {
      this.sumsNORTHAMERICA[month - 1] += amount;
    }
    if (this.continentMap.get(countryID) == "SOUTHAMERICA") {
      this.sumsSOUTHAMERICA[month - 1] += amount;
    }
    if (this.continentMap.get(countryID) == "ANTARCTICA") {
      this.sumsANTARCTICA[month - 1] += amount;
    }
    if (this.continentMap.get(countryID) == "OCEANIA") {
      this.sumsOCEANIA[month - 1] += amount;
    }
  }

  // Funktion um die aktuelle Tabelle auszudrucken
  async print(): Promise<void> {
    const response = await fetch("https://bootswatch.com/5/flatly/bootstrap.min.css");
    const cssText = await response.text();
    const cssFile = require('./stahl-export-quartal.component.css').toString();

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

