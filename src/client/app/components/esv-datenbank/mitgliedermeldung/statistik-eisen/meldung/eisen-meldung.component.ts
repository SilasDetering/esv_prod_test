import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReportService } from 'src/client/app/services/esvStatistikServices/report.service';
import { MemberService } from 'src/client/app/services/esvStatistikServices/member.service';
import { EsvCountryService } from 'src/client/app/services/esvImportServices/esvCountry.service';
import { HelperService } from 'src/client/app/services/helperServices/helper.service';
import { IronReport, ExportReport } from 'src/client/app/models/report.model';
import { Member } from 'src/client/app/models/member.model';
import { Subscription } from 'rxjs';
import { Country } from 'src/client/app/models/country.model';
import { FlashMessageService } from 'src/client/app/services/flashMessageServices/flash-message.service';

@Component({
  selector: 'app-eisen-meldung',
  templateUrl: './eisen-meldung.component.html',
  styleUrls: ['./eisen-meldung.component.css']
})
export class EisenMeldungComponent implements OnInit, OnDestroy{

  constructor(
    private flashMessage: FlashMessageService,
    private reportService: ReportService,
    private memberService: MemberService,
    private countryService: EsvCountryService,
    private router: Router,
    private helper: HelperService
  ) { }

  reportToDelete: IronReport | undefined;
  selectedMember: string = "";
  selectedDate: string = "";
  insertedFile: any;
  listOfLastRep: Array<IronReport> = [];
  listOfMembers: Array<Member> = [];
  listOfCountries: Array<Country> = [];
  selectedCountryIDs: Array<number> = [];

  // REPORT DATA
  blumendraht_inland = 0
  flachdraht_inland = 0
  kettendraht_inland = 0
  npStahldraehte_inland = 0
  nietendraht_inland = 0
  schraubendraht_inland = 0
  ed_blank_verkupfert_inland = 0
  ed_geglueht_inland = 0
  ed_verzinkt_bis_6_inland = 0
  ed_verzinkt_ueber_6_inland = 0
  ed_verzinnt_inland = 0
  ed_kuststoffummantelt_inland = 0
  stangendraht_inland = 0
  sonstige_inland = 0
  blumendraht_export = 0
  flachdraht_export = 0
  kettendraht_export = 0
  npStahldraehte_export = 0
  nietendraht_export = 0
  schraubendraht_export = 0
  ed_blank_verkupfert_export = 0
  ed_geglueht_export = 0
  ed_verzinkt_bis_6_export = 0
  ed_verzinkt_ueber_6_export = 0
  ed_verzinnt_export = 0
  ed_kuststoffummantelt_export = 0
  stangendraht_export = 0
  sonstige_export = 0
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
    const subscription = this.reportService.getListOfIronReports().subscribe((data) => {
      if (!data.success) {
        this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 5000 });
      } else {
        this.listOfLastRep = data.reportList;
        this.listOfLastRep.sort((a, b) => (a.insertDate < b.insertDate) ? 1 : -1);
      }
    })
    this.subscriptions.push(subscription);
  }

  // Läd eine Liste aller Mitglieder vom Server für die DropDown-Auswahl
  loadMembers() {
    const subscription = this.memberService.getListOfMembers().subscribe((data) => {
      if (!data.success) {
        this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 5000 });
      }
      this.listOfMembers = data.memberList;
      this.listOfMembers.sort((a, b) => (a.name > b.name) ? 1 : -1);
    })
    this.subscriptions.push(subscription);
  }

  // Läd eine Liste aller Länder vom Server in die Exportiert / aus denen Importiert wird.
  loadCountries() {
    const subscription = this.countryService.getListOfCountries("all").subscribe((data) => {
      if (!data.success) {
        this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 5000 });
      }
      this.listOfCountries = data.countryList;
    })
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
    const newReport = new IronReport(
      this.selectedMember,
      this.helper.normDate(this.selectedDate),
      new Date(),

      this.blumendraht_inland,
      this.flachdraht_inland,
      this.kettendraht_inland,
      this.npStahldraehte_inland,
      this.nietendraht_inland,
      this.schraubendraht_inland,
      this.ed_blank_verkupfert_inland,
      this.ed_geglueht_inland,
      this.ed_verzinkt_bis_6_inland,
      this.ed_verzinkt_ueber_6_inland,
      this.ed_verzinnt_inland,
      this.ed_kuststoffummantelt_inland,
      this.stangendraht_inland,
      this.sonstige_inland,

      this.blumendraht_export,
      this.flachdraht_export,
      this.kettendraht_export,
      this.npStahldraehte_export,
      this.nietendraht_export,
      this.schraubendraht_export,
      this.ed_blank_verkupfert_export,
      this.ed_geglueht_export,
      this.ed_verzinkt_bis_6_export,
      this.ed_verzinkt_ueber_6_export,
      this.ed_verzinnt_export,
      this.ed_kuststoffummantelt_export,
      this.stangendraht_export,
      this.sonstige_export,

      this.exportedProducts
    );

    // Report senden
    if (this.selectedDate != "") {
      const subscription = this.reportService.addIronReport(newReport).subscribe((data) => {
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
  redirectToReportView(report: IronReport) {
    this.router.navigate(['/esv-statistik/eisen-meldung/report-view'], { state: { selectedReport: report } });
  }

  // Löscht einen Datensatz aus der Liste der letzten Meldungen
  secondConfirm(report: IronReport) {
    this.reportToDelete = report
    document.getElementById("secondConfirm")!.style.display = "inline";
  }
  abortConfirm() {
    this.reportToDelete = undefined;
    document.getElementById("secondConfirm")!.style.display = "none";
  }
  deleteReport(report: IronReport | undefined) {
    if (report) {
      const subscription = this.reportService.deleteIronReport(report).subscribe((data) => {
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
