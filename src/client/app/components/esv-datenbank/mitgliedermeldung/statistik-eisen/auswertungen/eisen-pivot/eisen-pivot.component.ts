import { Component, OnDestroy, OnInit } from '@angular/core';
import { Member } from 'src/client/app/models/member.model';
import { IronReport } from 'src/client/app/models/report.model';
import { MemberService } from 'src/client/app/services/esvStatistikServices/member.service';
import { ReportService } from 'src/client/app/services/esvStatistikServices/report.service';
import { Subscription } from 'rxjs';
import { FlashMessageService } from 'src/client/app/services/flashMessageServices/flash-message.service';

@Component({
  selector: 'app-eisen-pivot',
  templateUrl: './eisen-pivot.component.html',
  styleUrls: ['./eisen-pivot.component.css']
})
export class EisenPivotComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];

  constructor(private flashMessage: FlashMessageService, private reportService: ReportService, private memberService: MemberService) { }

  listOfMembers: Array<Member> = [];
  listOfMonths: Array<string> = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  listOfYears: Array<string> = [];
  selectedMemberList: Array<string> = [];
  selectedMonthList: Array<string> = [];
  selectedYearList: Array<string> = [];
  currentIronReportList: Array<IronReport> = [];

  blumendraht_inland_sum = 0;
  flachdraht_inland_sum = 0;
  kettendraht_inland_sum = 0;
  npStahldraehte_inland_sum = 0;
  nietendraht_inland_sum = 0;
  schraubendraht_inland_sum = 0;
  ed_blank_verkupfert_inland_sum = 0;
  ed_geglueht_inland_sum = 0;
  ed_verzinkt_bis_6_inland_sum = 0;
  ed_verzinkt_ueber_6_inland_sum = 0;
  ed_verzinnt_inland_sum = 0;
  ed_kuststoffummantelt_inland_sum = 0;
  stangendraht_inland_sum = 0;
  sonstige_inland_sum = 0;

  blumendraht_export_sum = 0;
  flachdraht_export_sum = 0;
  kettendraht_export_sum = 0;
  npStahldraehte_export_sum = 0;
  nietendraht_export_sum = 0;
  schraubendraht_export_sum = 0;
  ed_blank_verkupfert_export_sum = 0;
  ed_geglueht_export_sum = 0;
  ed_verzinkt_bis_6_export_sum = 0;
  ed_verzinkt_ueber_6_export_sum = 0;
  ed_verzinnt_export_sum = 0;
  ed_kuststoffummantelt_export_sum = 0;
  stangendraht_export_sum = 0;
  sonstige_export_sum = 0;

  blumendraht_ges_sum = 0;
  flachdraht_ges_sum = 0;
  kettendraht_ges_sum = 0;
  npStahldraehte_ges_sum = 0;
  nietendraht_ges_sum = 0;
  schraubendraht_ges_sum = 0;
  ed_blank_verkupfert_ges_sum = 0;
  ed_geglueht_ges_sum = 0;
  ed_verzinkt_bis_6_ges_sum = 0;
  ed_verzinkt_ueber_6_ges_sum = 0;
  ed_verzinnt_ges_sum = 0;
  ed_kuststoffummantelt_ges_sum = 0;
  stangendraht_ges_sum = 0;
  sonstige_ges_sum = 0;

  inland_sum = 0;
  export_sum = 0;
  ges_sum = 0;

  ngOnInit(): void {
    this.loadMembers();
    this.loadYears();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  // Läd eine Liste aller Mitglieder vom Server für die DropDown-Auswahl
  loadMembers() {
    const subscription = this.memberService.getListOfMembers().subscribe((data) => {
      if (!data.success) {
        this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 5000 });
      }
      this.listOfMembers = data.memberList;
    })
    this.subscriptions.push(subscription);
  }

  // Läd eine Liste aller möglichen Jahre vom Server für die Meldungen vorhanden sind
  loadYears() {
    const subscription = this.reportService.getIronReportDates().subscribe((data) => {
      if (!data.success) {
        this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 5000 });
      }
      if (data.reportList.length != 0) {
        const currentDate: Date = new Date();
        const currentYear: String = currentDate.getFullYear().toString();
        let yearAsNumber: number = parseInt(data.reportList[0].reportDate.substring(0, 4))
        while (yearAsNumber.toString() != currentYear) {
          this.listOfYears.unshift(yearAsNumber.toString());
          yearAsNumber++;
        }
        this.listOfYears.unshift(yearAsNumber.toString());
      }
    })
    this.subscriptions.push(subscription);
  }

  onSelect() {
    this.selectedMonthList = [];
    this.selectedMemberList = [];
    this.selectedYearList = [];

    if ((document.getElementById("MEMBER_ALL") as HTMLInputElement).checked) {
      for (let i = 0; i < this.listOfMembers.length; i++) {
        this.selectedMemberList[i] = this.listOfMembers[i].ID;
      }
    } else {
      let j = 0;
      for (let index = 0; index < this.listOfMembers.length; index++) {
        if ((document.getElementById(this.listOfMembers[index].ID.toString()) as HTMLInputElement).checked) {
          this.selectedMemberList[j] = this.listOfMembers[index].ID.toString();
          j++;
        }
      }
    }

    if ((document.getElementById("MONTH_ALL") as HTMLInputElement).checked) {
      this.selectedMonthList = this.listOfMonths;
    } else {
      let i = 0;
      for (let index = 0; index < this.listOfMonths.length; index++) {
        if ((document.getElementById("MONTH_" + this.listOfMonths[index]) as HTMLInputElement).checked) {
          this.selectedMonthList[i] = this.listOfMonths[index];
          i++;
        }
      }
    }

    if ((document.getElementById("YEAR_ALL") as HTMLInputElement).checked) {
      this.selectedYearList = this.listOfYears;
    } else {
      let i = 0;
      for (let index = 0; index < this.listOfYears.length; index++) {
        if ((document.getElementById("YEAR_" + this.listOfYears[index]) as HTMLInputElement).checked) {
          this.selectedYearList[i] = this.listOfYears[index];
          i++;
        }
      }
    }

    const subscription = this.reportService.getFilteredListOfIronReports(this.selectedMemberList, this.getReportDateList()).subscribe((data) => {
      if (!data.success) {
        this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 5000 });
      }
      this.currentIronReportList = data.reportList;
      this.updateSum();
    });
    this.subscriptions.push(subscription);
  }


  getReportDateList(): Array<string> {
    let reportDateList: Array<string> = [];
    let index = 0;
    for (let i = 0; i < this.selectedMonthList.length; i++) {
      for (let j = 0; j < this.selectedYearList.length; j++) {
        reportDateList[index] = this.selectedYearList[j] + "-" + this.selectedMonthList[i] + "-" + "01";
        index++;
      }
    }
    return reportDateList;
  }

  updateSum() {
    this.blumendraht_inland_sum = 0;
    this.blumendraht_export_sum = 0;
    this.ed_blank_verkupfert_export_sum = 0;
    this.ed_blank_verkupfert_inland_sum = 0;
    this.ed_geglueht_export_sum = 0;
    this.ed_geglueht_inland_sum = 0;
    this.ed_kuststoffummantelt_export_sum = 0;
    this.ed_kuststoffummantelt_inland_sum = 0;
    this.ed_verzinkt_bis_6_export_sum = 0;
    this.ed_verzinkt_bis_6_inland_sum = 0;
    this.ed_verzinkt_ueber_6_export_sum = 0;
    this.ed_verzinkt_ueber_6_inland_sum = 0;
    this.ed_verzinnt_export_sum = 0;
    this.ed_verzinnt_inland_sum = 0;
    this.flachdraht_export_sum = 0;
    this.flachdraht_inland_sum = 0;
    this.kettendraht_export_sum = 0;
    this.kettendraht_inland_sum = 0;
    this.nietendraht_export_sum = 0;
    this.nietendraht_inland_sum = 0;
    this.npStahldraehte_export_sum = 0;
    this.npStahldraehte_inland_sum = 0;
    this.schraubendraht_export_sum = 0;
    this.schraubendraht_inland_sum = 0;
    this.sonstige_export_sum = 0;
    this.sonstige_inland_sum = 0;
    this.stangendraht_export_sum = 0;
    this.stangendraht_inland_sum = 0;

    this.currentIronReportList.forEach(report => {
      this.blumendraht_inland_sum += report.blumendraht_inland;
      this.blumendraht_export_sum += report.blumendraht_export;
      this.ed_blank_verkupfert_export_sum += report.ed_blank_verkupfert_export;
      this.ed_blank_verkupfert_inland_sum += report.ed_blank_verkupfert_inland;
      this.ed_geglueht_export_sum += report.ed_geglueht_export;
      this.ed_geglueht_inland_sum += report.ed_geglueht_inland;
      this.ed_kuststoffummantelt_export_sum += report.ed_kuststoffummantelt_export;
      this.ed_kuststoffummantelt_inland_sum += report.ed_kuststoffummantelt_inland;
      this.ed_verzinkt_bis_6_export_sum += report.ed_verzinkt_bis_6_export;
      this.ed_verzinkt_bis_6_inland_sum += report.ed_verzinkt_bis_6_inland;
      this.ed_verzinkt_ueber_6_export_sum += report.ed_verzinkt_ueber_6_export;
      this.ed_verzinkt_ueber_6_inland_sum += report.ed_verzinkt_ueber_6_inland;
      this.ed_verzinnt_export_sum += report.ed_verzinnt_export;
      this.ed_verzinnt_inland_sum += report.ed_verzinnt_inland;
      this.flachdraht_export_sum += report.flachdraht_export;
      this.flachdraht_inland_sum += report.flachdraht_inland;
      this.kettendraht_export_sum += report.kettendraht_export;
      this.kettendraht_inland_sum += report.kettendraht_inland;
      this.nietendraht_export_sum += report.nietendraht_export;
      this.nietendraht_inland_sum += report.nietendraht_inland;
      this.npStahldraehte_export_sum += report.npStahldraehte_export;
      this.npStahldraehte_inland_sum += report.npStahldraehte_inland;
      this.schraubendraht_export_sum += report.schraubendraht_export;
      this.schraubendraht_inland_sum += report.schraubendraht_inland;
      this.sonstige_export_sum += report.sonstige_export;
      this.sonstige_inland_sum += report.sonstige_inland;
      this.stangendraht_export_sum += report.stangendraht_export;
      this.stangendraht_inland_sum += report.stangendraht_inland;
    });

    this.blumendraht_ges_sum = this.blumendraht_export_sum + this.blumendraht_inland_sum;
    this.flachdraht_ges_sum = this.flachdraht_export_sum + this.flachdraht_inland_sum;
    this.kettendraht_ges_sum = this.kettendraht_export_sum + this.kettendraht_inland_sum;
    this.npStahldraehte_ges_sum = this.npStahldraehte_export_sum + this.npStahldraehte_inland_sum;
    this.nietendraht_ges_sum = this.nietendraht_export_sum + this.nietendraht_inland_sum;
    this.schraubendraht_ges_sum = this.schraubendraht_export_sum + this.schraubendraht_inland_sum;
    this.ed_blank_verkupfert_ges_sum = this.ed_blank_verkupfert_export_sum + this.ed_blank_verkupfert_inland_sum;
    this.ed_geglueht_ges_sum = this.ed_geglueht_export_sum + this.ed_geglueht_inland_sum;
    this.ed_verzinkt_bis_6_ges_sum = this.ed_verzinkt_bis_6_export_sum + this.ed_verzinkt_bis_6_inland_sum;
    this.ed_verzinkt_ueber_6_ges_sum = this.ed_verzinkt_ueber_6_export_sum + this.ed_verzinkt_ueber_6_inland_sum;
    this.ed_verzinnt_ges_sum = this.ed_verzinnt_export_sum + this.ed_verzinnt_inland_sum;
    this.ed_kuststoffummantelt_ges_sum = this.ed_kuststoffummantelt_export_sum + this.ed_kuststoffummantelt_inland_sum;
    this.stangendraht_ges_sum = this.stangendraht_export_sum + this.stangendraht_inland_sum;
    this.sonstige_ges_sum = this.sonstige_export_sum + this.sonstige_inland_sum;

    this.inland_sum = this.blumendraht_inland_sum
      + this.flachdraht_inland_sum
      + this.kettendraht_inland_sum
      + this.npStahldraehte_inland_sum
      + this.nietendraht_inland_sum
      + this.schraubendraht_inland_sum
      + this.ed_blank_verkupfert_inland_sum
      + this.ed_geglueht_inland_sum
      + this.ed_verzinkt_bis_6_inland_sum
      + this.ed_verzinkt_ueber_6_inland_sum
      + this.ed_verzinnt_inland_sum
      + this.ed_kuststoffummantelt_inland_sum
      + this.stangendraht_inland_sum
      + this.sonstige_inland_sum;

    this.export_sum = this.blumendraht_export_sum
      + this.flachdraht_export_sum
      + this.kettendraht_export_sum
      + this.npStahldraehte_export_sum
      + this.nietendraht_export_sum
      + this.schraubendraht_export_sum
      + this.ed_blank_verkupfert_export_sum
      + this.ed_geglueht_export_sum
      + this.ed_verzinkt_bis_6_export_sum
      + this.ed_verzinkt_ueber_6_export_sum
      + this.ed_verzinnt_export_sum
      + this.ed_kuststoffummantelt_export_sum
      + this.stangendraht_export_sum
      + this.sonstige_export_sum;

    this.ges_sum = this.inland_sum + this.export_sum;
  }

  // Funktion um die aktuelle Tabelle auszudrucken
  async print(): Promise<void> {
    const response = await fetch("https://bootswatch.com/5/flatly/bootstrap.min.css");
    const cssText = await response.text();
    const cssFile = require('./eisen-pivot.component.css').toString();

    const printWindow = window.open('', '', 'height=800,width=1200');

    if (printWindow) {
      const tableToPrint = document.getElementById("printIronTotal");

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
