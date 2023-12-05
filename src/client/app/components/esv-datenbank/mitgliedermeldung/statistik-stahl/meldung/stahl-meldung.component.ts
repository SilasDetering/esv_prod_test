import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReportService } from 'src/client/app/services/esvStatistikServices/report.service';
import { MemberService } from 'src/client/app/services/esvStatistikServices/member.service';
import { EsvCountryService } from 'src/client/app/services/esvImportServices/esvCountry.service';
import { HelperService } from 'src/client/app/services/helperServices/helper.service';
import { SteelReport, ExportReport } from 'src/client/app/models/report.model';
import { Member } from 'src/client/app/models/member.model';
import { Subscription } from 'rxjs';
import { Country } from 'src/client/app/models/country.model';
import { FlashMessageService } from 'src/client/app/services/flashMessageServices/flash-message.service';

@Component({
  selector: 'app-stahl-meldung',
  templateUrl: './stahl-meldung.component.html',
  styleUrls: ['./stahl-meldung.component.css']
})
export class StahlMeldungComponent implements OnInit, OnDestroy {

  constructor(
    private flashMessage: FlashMessageService,
    private reportService: ReportService,
    private memberService: MemberService,
    private countryService: EsvCountryService,
    private router: Router,
    private helper: HelperService
  ) { }

  reportToDelete: SteelReport | undefined;
  selectedMember: string = "";
  selectedDate: string = "";
  insertedFile: any;
  listOfLastRep: Array<SteelReport> = [];
  listOfMembers: Array<Member> = [];
  listOfCountries: Array<Country> = [];
  selectedCountryIDs: Array<number> = [];

  // REPORT DATA
  seildraht_inland = 0;
  polsterfederdraht_inland = 0;
  federdraht_SH_SL_SM_inland = 0;
  federdraht_DH_DM_inland = 0;
  federdraht_sonstig_inland = 0;
  draehte_sonstige_inland = 0;

  seildraht_export = 0;
  polsterfederdraht_export = 0;
  federdraht_SH_SL_SM_export = 0;
  federdraht_DH_DM_export = 0;
  federdraht_sonstig_export = 0;
  draehte_sonstige_export = 0;

  exportedProducts: Array<ExportReport> = [];

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.loadLastReports();
    this.loadMembers();
    this.loadCountries();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  // Läd eine Liste der vorhandenen Meldungen vom Server
  loadLastReports() {
    const subscription = this.reportService.getListOfSteelReports().subscribe((data) => {
      if (!data.success) {
        this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 5000 });
      } else {
        this.listOfLastRep = data.reportList;
      }
    });
    this.subscriptions.push(subscription);
  }

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

  // Läd eine Liste aller Länder vom Server in die Exportiert / aus denen Importiert wird.
  loadCountries() {
    const subscription = this.countryService.getListOfCountries("all").subscribe((data) => {
      if (!data.success) {
        this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 5000 });
      }
      this.listOfCountries = data.countryList;
    });
    this.subscriptions.push(subscription);
  }

  addExportRep() {
    const newIndex = this.exportedProducts.length;
    this.exportedProducts.push({ countryID: "", countryName: "", amount: 0, name: `countryExp_${newIndex}` });
  }

  removeExportRep(index: number) {
    this.exportedProducts.splice(index, 1)
  }

  // Submit Reports
  onReportSubmit() {
    const newReport = new SteelReport(
      this.selectedMember,
      this.helper.normDate(this.selectedDate),
      new Date(),

      this.seildraht_inland,
      this.polsterfederdraht_inland,
      this.federdraht_SH_SL_SM_inland,
      this.federdraht_DH_DM_inland,
      this.federdraht_sonstig_inland,
      this.draehte_sonstige_inland,
    
      this.seildraht_export,
      this.polsterfederdraht_export,
      this.federdraht_SH_SL_SM_export,
      this.federdraht_DH_DM_export,
      this.federdraht_sonstig_export,
      this.draehte_sonstige_export,

      this.exportedProducts
    )

    // Report senden
    if (this.selectedDate != "") {
      const subscription = this.reportService.addSteelReport(newReport).subscribe((data) => {
        if (!data.success) {
          this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 5000 })
        } else {
          window.location.reload();
        }
      });
      this.subscriptions.push(subscription);
    } else {
      this.flashMessage.show("Bitte ein Datum auswählen", { cssClass: 'alert-danger', timeout: 5000 })
    }
  }

  // Speichert die vom File-Input übergebene Datei in insertedFile ab
  handleFileInput($event: any) {
    this.insertedFile = $event.srcElement.files;
  }

  // Leitet an die ReportView Seite weiter und übergibt die gewählte Meldung
  redirectToReportView(report: SteelReport) {
    this.router.navigate(['/esv-statistik/stahl-meldung/report-view'], { state: { selectedReport: report } });
  }

  // Löscht einen Datensatz aus der Liste der letzten Meldungen
  secondConfirm(report: SteelReport) {
    this.reportToDelete = report
    document.getElementById("secondConfirm")!.style.display = "inline";
  }
  abortConfirm() {
    this.reportToDelete = undefined;
    document.getElementById("secondConfirm")!.style.display = "none";
  }
  deleteReport(report: SteelReport | undefined) {
    if (report) {
      const subscription = this.reportService.deleteSteelReport(report).subscribe((data) => {
        if (!data.success) {
          this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 5000 })
        } else {
          this.flashMessage.show("Die Meldung von "+ report.companyID +" vom "+ report.reportDate +" wurden gelöscht", { cssClass: 'alert-success', timeout: 5000 });
          this.abortConfirm();
          this.loadLastReports();
        }
      });
      this.subscriptions.push(subscription);
    } else {
      this.flashMessage.show("Fehler beim löschen des Berichtes.", { cssClass: 'alert-danger', timeout: 5000 })
    }
  }
}

