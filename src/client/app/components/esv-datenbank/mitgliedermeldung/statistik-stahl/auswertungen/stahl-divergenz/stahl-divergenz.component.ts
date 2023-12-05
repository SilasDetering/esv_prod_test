import { Component, OnDestroy, OnInit } from '@angular/core';
import { HelperService } from 'src/client/app/services/helperServices/helper.service';
import { ReportService } from 'src/client/app/services/esvStatistikServices/report.service';
import { SteelReport, SummarizedSteelReport } from 'src/client/app/models/report.model';
import { MtglDivergenzStahlService } from 'src/client/app/services/helperServices/mtgl-divergenz-stahl.service';
import { Subscription } from 'rxjs';
import { FlashMessageService } from 'src/client/app/services/flashMessageServices/flash-message.service';

@Component({
  selector: 'app-stahl-divergenz',
  templateUrl: './stahl-divergenz.component.html',
  styleUrls: ['./stahl-divergenz.component.css']
})
export class StahlDivergenzComponent implements OnInit, OnDestroy {

  constructor(
    private helper: HelperService,
    private reportService: ReportService,
    private flashMessage: FlashMessageService,
    private divergenzService: MtglDivergenzStahlService
  ) { }

  selectedDate: string = this.helper.getCurrentDateString();
  steelReportMonthSum: SummarizedSteelReport[] = [];
  steelReportYearSum: SummarizedSteelReport[] = [];
  steelReportQuarterSum: SummarizedSteelReport[] = [];

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.loadStatistiks();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }  

  loadStatistiks() {
    const subscription = this.reportService.getSteelReportsUntilDate(this.helper.normDate(this.selectedDate)).subscribe(data => {
      if (!data.success) return this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 5000 });
      else {
        console.log(data.reportList)
        this.calculateStatistiks(data.reportList);
      }
    });
    this.subscriptions.push(subscription);
  }

  calculateStatistiks(listOfReports: Array<SteelReport>) {
    let steelReports = this.divergenzService.summarizeSteelReport(listOfReports);
    this.steelReportMonthSum = this.divergenzService.calculateSteelReportMonthSum(steelReports, this.selectedDate);
    this.steelReportYearSum = this.divergenzService.calculateSteelReportYearSum(steelReports, this.selectedDate);
    this.steelReportQuarterSum = this.divergenzService.calculateSteelReportQuarterSum(steelReports, this.selectedDate);
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
