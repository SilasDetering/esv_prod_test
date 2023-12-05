import { Component, OnDestroy, OnInit } from '@angular/core';
import { Invoice } from 'src/client/app/models/invoice.model';
import { Member } from 'src/client/app/models/member.model';
import { InvoiceService } from 'src/client/app/services/esvStatistikServices/invoice.service';
import { MemberResponse, MemberService } from 'src/client/app/services/esvStatistikServices/member.service';
import { IronResponse, ReportService, SteelResponse } from 'src/client/app/services/esvStatistikServices/report.service';
import { HelperService } from 'src/client/app/services/helperServices/helper.service';
import { Subscription, forkJoin } from 'rxjs';
import { IronReport, SteelReport } from 'src/client/app/models/report.model';
import { FlashMessageService } from 'src/client/app/services/flashMessageServices/flash-message.service';

@Component({
  selector: 'app-stahl-rechnungen',
  templateUrl: './stahl-rechnungen.component.html',
  styleUrls: ['./stahl-rechnungen.component.css']
})
export class StahlRechnungenComponent implements OnInit, OnDestroy {
  maxContrib: number = 40000;
  eurosPerImportTon = 1.10;
  eurosPerExportTon = 1.10;

  selectedMemberID: string = "";
  selectedMember: Member | undefined
  selectedDate: string | undefined;

  listOfMembers: Array<Member> = [];

  invoice: Invoice | undefined;

  private subscriptions: Subscription[] = [];

  constructor(
    private memberService: MemberService,
    private reportService: ReportService,
    private flashMessage: FlashMessageService,
    private helper: HelperService,
    private invoiceService: InvoiceService
  ) { }

  ngOnInit(): void {
    this.loadMembers();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onDateChange(): void {
    if (this.selectedDate == undefined) return;
    this.selectedDate = this.helper.normDate(this.selectedDate);
    this.loadReports();
  }

  onMemberChange(): void {
    if (this.selectedMemberID == undefined) return;
    this.selectedMember = this.listOfMembers.find(member => member.ID === this.selectedMemberID)!;
    this.loadReports();
  }

  // Läd alle Berichte für das ausgewählte Datum und die Gruppe des Ausgewählten Mitgliedes vom Server
  loadReports(): void {
    if (this.selectedDate == undefined || this.selectedMember == undefined) return;

    const member = this.selectedMember;
    const date = this.selectedDate;

    const listOfIronReports: Array<IronReport> = [];
    const listOfSteelReports: Array<SteelReport> = [];
    const listOfMembers: Array<Member> = [];

    // Observable for Iron reports
    const ironObservable = this.reportService.getIronReportsByGroupAndDate(this.selectedMember, this.selectedDate);

    // Observable for Steel reports
    const steelObservable = this.reportService.getSteelReportsByGroupAndDate(this.selectedMember, this.selectedDate);

    // Observable for Member req
    const memberObservable = this.memberService.getGroupMembersByMember(this.selectedMember);

    // Use forkJoin to wait for both observables
    const subscription = forkJoin([ironObservable, steelObservable, memberObservable]).subscribe({
      next: (data: [IronResponse, SteelResponse, MemberResponse]) => {
        const ironData = data[0];
        const steelData = data[1];
        const memberData = data[2]

        if (!ironData.success) {
          this.flashMessage.show(ironData.msg, { cssClass: 'alert-danger', timeout: 5000 });
        }
        listOfIronReports.push(...ironData.reportList);

        if (!steelData.success) {
          this.flashMessage.show(steelData.msg, { cssClass: 'alert-danger', timeout: 5000 });
        }
        listOfSteelReports.push(...steelData.reportList);

        if (!memberData.success) {
          this.flashMessage.show(memberData.msg, { cssClass: 'alert-danger', timeout: 5000 })
        }
        listOfMembers.push(...memberData.memberList);

        // Generiere Rechnungen sobalt alle Daten geladen wurden
        this.invoice = this.invoiceService.generateSteelInvoice(member, listOfMembers, date, listOfIronReports, listOfSteelReports)
      },

      error: (err: any) => {
        // Handle errors during the wait for both resources
        console.error('Error loading reports:', err);
      },
    });

    this.subscriptions.push(subscription);
  }

  // Läd eine Liste aller Mitglieder vom Server für die DropDown-Auswahl
  loadMembers() {
    const subscription = this.memberService.getListOfMembers().subscribe((data: { success: any; msg: any; memberList: Member[]; }) => {
      if (!data.success) {
        this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 5000 });
      }
      this.listOfMembers = data.memberList;
    })
    this.subscriptions.push(subscription);
  }

  /**
   * Wechselt zwischen den Einzelnen Ansichten für die Darstellung der Daten des Statistischen Bundesamtes
   * @param id ID des Tabs der anzuzeigen ist
   */
  changeView(id: string) {
    try {
      document.getElementById("A")!.className = "nav-link"
      document.getElementById("tab_A")!.className = "tab-pane fade"
      document.getElementById("B")!.className = "nav-link"
      document.getElementById("tab_B")!.className = "tab-pane fade"

      document.getElementById(id)!.className = "nav-link nav-link active"
      document.getElementById("tab_" + id)!.className = "tab-pane fade active show"
    } catch (error) {
      console.log("Tab-Element konnte nicht gefunden werden")
    }
  }

}
