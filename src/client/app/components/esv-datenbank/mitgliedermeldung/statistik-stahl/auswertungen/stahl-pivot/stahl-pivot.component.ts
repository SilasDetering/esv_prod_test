import { Component, OnDestroy, OnInit } from '@angular/core';
import { Member } from 'src/client/app/models/member.model';
import { SteelReport } from 'src/client/app/models/report.model';
import { MemberService } from 'src/client/app/services/esvStatistikServices/member.service';
import { ReportService } from 'src/client/app/services/esvStatistikServices/report.service';
import { HelperService } from 'src/client/app/services/helperServices/helper.service';
import { Subscription } from 'rxjs';
import { FlashMessageService } from 'src/client/app/services/flashMessageServices/flash-message.service';

@Component({
  selector: 'app-stahl-pivot',
  templateUrl: './stahl-pivot.component.html',
  styleUrls: ['./stahl-pivot.component.css']
})
export class StahlPivotComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];

  constructor(private flashMessage: FlashMessageService, private reportService: ReportService, private memberService: MemberService, private helper: HelperService) { }

  listOfMembers: Array<Member> = [];
  listOfMonths: Array<String> = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  listOfYears: Array<String> = [];
  selectedMemberList: Array<String> = [];
  selectedMonthList: Array<String> = [];
  selectedYearList: Array<String> = [];
  currentSteelReportList: Array<SteelReport> = [];

  seildraht_inland_sum = 0;
  polsterfederdraht_inland_sum = 0;
  federdraht_SH_SL_SM_inland_sum = 0;
  federdraht_DH_DM_inland_sum = 0;
  federdraht_sonstig_inland_sum = 0;
  draehte_sonstige_inland_sum = 0;

  seildraht_export_sum = 0;
  polsterfederdraht_export_sum = 0;
  federdraht_SH_SL_SM_export_sum = 0;
  federdraht_DH_DM_export_sum = 0;
  federdraht_sonstig_export_sum = 0;
  draehte_sonstige_export_sum = 0;

  seildraht_ges_sum = 0;
  polsterfederdraht_ges_sum = 0;
  federdraht_SH_SL_SM_ges_sum = 0;
  federdraht_DH_DM_ges_sum = 0;
  federdraht_sonstig_ges_sum = 0;
  draehte_sonstige_ges_sum = 0;
  
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

  // HTML Helper Methods
  addNumbers(numbers: (number | undefined)[]) { return this.helper.addNumbers(numbers) }

  // Läd eine Liste aller Mitglieder vom Server für die DropDown-Auswahl
  loadMembers() {
    const subscription = this.memberService.getListOfMembers().subscribe((data) => {
      if (!data.success) {
        this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 5000 });
      }
      this.listOfMembers = data.memberList;
    });
    this.subscriptions.push(subscription);
  }

  loadYears() {
    const subscription = this.reportService.getSteelReportDates().subscribe((data) => {
      if (!data.success) {
        this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 5000 });
      }
      const currentDate: Date = new Date();
      const currentYear: String = currentDate.getFullYear().toString();
      let yearAsNumber: number = parseInt(data.reportList[0].reportDate.substring(0, 4))
      while (yearAsNumber.toString() != currentYear) {
        this.listOfYears.unshift(yearAsNumber.toString());
        yearAsNumber++;
      }
      this.listOfYears.unshift(yearAsNumber.toString());
    });
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

    if (this.selectedMemberList.length != 0 && this.selectedMonthList.length != 0 && this.selectedYearList.length != 0) {
      const subscription = this.reportService.getFilteredListOfSteelReports(this.selectedMemberList, this.getReportDateList()).subscribe((data) => {
        if (!data.success) {
          this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 5000 });
        }
        this.currentSteelReportList = data.reportList;
        this.updateSum();
      });
      this.subscriptions.push(subscription);
    }
  }

  getReportDateList(): Array<String> {
    let reportDateList: Array<String> = [];
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
    this.seildraht_inland_sum = 0;
    this.seildraht_export_sum = 0;
    this.polsterfederdraht_export_sum = 0;
    this.polsterfederdraht_inland_sum = 0;
    this.federdraht_SH_SL_SM_export_sum = 0;
    this.federdraht_SH_SL_SM_inland_sum = 0;
    this.federdraht_sonstig_export_sum = 0;
    this.federdraht_sonstig_inland_sum = 0;
    this.federdraht_DH_DM_export_sum = 0;
    this.federdraht_DH_DM_inland_sum = 0;
    this.draehte_sonstige_export_sum = 0;
    this.draehte_sonstige_inland_sum = 0;

    this.currentSteelReportList.forEach(report => {
      this.seildraht_inland_sum += report.seildraht_inland;
      this.seildraht_export_sum += report.seildraht_export;
      this.polsterfederdraht_export_sum += report.polsterfederdraht_export;
      this.polsterfederdraht_inland_sum += report.polsterfederdraht_inland;
      this.federdraht_SH_SL_SM_export_sum += report.federdraht_SH_SL_SM_export;
      this.federdraht_SH_SL_SM_inland_sum += report.federdraht_SH_SL_SM_inland;
      this.federdraht_sonstig_export_sum += report.federdraht_sonstig_export;
      this.federdraht_sonstig_inland_sum += report.federdraht_sonstig_inland;
      this.federdraht_DH_DM_export_sum += report.federdraht_DH_DM_export;
      this.federdraht_DH_DM_inland_sum += report.federdraht_DH_DM_inland;
      this.draehte_sonstige_export_sum += report.draehte_sonstige_export;
      this.draehte_sonstige_inland_sum += report.draehte_sonstige_inland;
    });

    this.seildraht_ges_sum = this.seildraht_export_sum + this.seildraht_inland_sum;
    this.polsterfederdraht_ges_sum = this.polsterfederdraht_export_sum + this.polsterfederdraht_inland_sum;
    this.federdraht_SH_SL_SM_ges_sum = this.federdraht_SH_SL_SM_export_sum + this.federdraht_SH_SL_SM_inland_sum;
    this.federdraht_DH_DM_ges_sum = this.federdraht_DH_DM_export_sum + this.federdraht_DH_DM_inland_sum;
    this.federdraht_sonstig_ges_sum = this.federdraht_sonstig_export_sum + this.federdraht_sonstig_inland_sum;
    this.draehte_sonstige_ges_sum = this.draehte_sonstige_export_sum + this.draehte_sonstige_inland_sum;

    this.inland_sum = this.seildraht_inland_sum
      + this.polsterfederdraht_inland_sum
      + this.federdraht_SH_SL_SM_inland_sum
      + this.federdraht_DH_DM_inland_sum
      + this.federdraht_sonstig_inland_sum
      + this.draehte_sonstige_inland_sum

    this.export_sum = this.seildraht_export_sum
      + this.polsterfederdraht_export_sum
      + this.federdraht_SH_SL_SM_export_sum
      + this.federdraht_DH_DM_export_sum
      + this.federdraht_sonstig_export_sum
      + this.draehte_sonstige_export_sum

    this.ges_sum = this.inland_sum + this.export_sum;
  }

  // Funktion um die aktuelle Tabelle auszudrucken
  async print(): Promise<void> {
    const response = await fetch("https://bootswatch.com/5/flatly/bootstrap.min.css");
    const cssText = await response.text();
    const cssFile = require('./stahl-pivot.component.css').toString();

    const printWindow = window.open('', '', 'height=800,width=1200');

    if (printWindow) {
      const tableToPrint = document.getElementById("printSteelTotal");

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
