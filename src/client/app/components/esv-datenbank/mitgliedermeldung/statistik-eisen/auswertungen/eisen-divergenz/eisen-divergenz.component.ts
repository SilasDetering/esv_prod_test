import { Component, OnDestroy, OnInit } from '@angular/core';
import { HelperService } from 'src/client/app/services/helperServices/helper.service';
import { ReportService } from 'src/client/app/services/esvStatistikServices/report.service';
import { IronReport, SummarizedIronReport } from 'src/client/app/models/report.model';
import { MtglDivergenzEisenService } from 'src/client/app/services/helperServices/mtgl-divergenz-eisen.service';
import { Subscription } from 'rxjs';
import { FlashMessageService } from 'src/client/app/services/flashMessageServices/flash-message.service';

@Component({
  selector: 'app-eisen-divergenz',
  templateUrl: './eisen-divergenz.component.html',
  styleUrls: ['./eisen-divergenz.component.css']
})
export class EisenDivergenzComponent implements OnInit, OnDestroy {

  constructor(
    private helper: HelperService,
    private reportService: ReportService,
    private flashMessage: FlashMessageService,
    private divergenzService: MtglDivergenzEisenService
  ) { }

  selectedDate: string = this.helper.getCurrentDateString();
  ironReportMonthSum: SummarizedIronReport[] = [];
  ironReportYearSum: SummarizedIronReport[] = [];
  ironReportQuarterSum: SummarizedIronReport[] = [];

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.loadStatistiks();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  loadStatistiks() {
    const subscription = this.reportService.getIronReportsUntilDate(this.helper.normDate(this.selectedDate)).subscribe(data => {
      if (!data.success) return this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 5000 });
      else {
        console.log(data.reportList)
        this.calculateStatistiks(data.reportList);
      }
    });
    this.subscriptions.push(subscription);
  }

  calculateStatistiks(listOfReports: Array<IronReport>) {
    let ironReports = this.divergenzService.summarizeIronReport(listOfReports);
    this.ironReportMonthSum = this.divergenzService.calculateIronReportMonthSum(ironReports, this.selectedDate);
    this.ironReportYearSum = this.divergenzService.calculateIronReportYearSum(ironReports, this.selectedDate);
    this.ironReportQuarterSum = this.divergenzService.calculateIronReportQuarterSum(ironReports, this.selectedDate);

    console.log(this.ironReportMonthSum)
    console.log(this.ironReportYearSum)
    console.log(this.ironReportQuarterSum)
  }

  setDate(event: Event) {
    this.selectedDate = (event.target as HTMLInputElement).value;
    this.loadStatistiks();
  }

  /**
  * Wechselt zwischen den Einzelnen Ansichten
  * @param id ID des Tabs der anzuzeigen ist
  */
  changeView(id: string) {
    try {
      document.getElementById("monat")!.className = "nav-link"
      document.getElementById("tab_monat")!.className = "tab-pane fade"
      document.getElementById("quarter")!.className = "nav-link"
      document.getElementById("tab_quarter")!.className = "tab-pane fade"

      document.getElementById(id)!.className = "nav-link nav-link active"
      document.getElementById("tab_" + id)!.className = "tab-pane fade active show"
    } catch (error) {
      console.log("Tab-Element konnte nicht gefunden werden")
    }
  }
}
