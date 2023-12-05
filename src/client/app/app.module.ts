import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

import { AuthService } from './services/authenticationServices/auth.service';
import { ValidateService } from './services/authenticationServices/validate.service';
import { FlashMessageService } from './services/flashMessageServices/flash-message.service';

import { User } from './models/user.model';

import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { EsvAuswertungenComponent } from './components/esv-datenbank/import/auswertungen/esv-auswertungen.component';
import { EsvImportIronPerYearComponent } from './components/esv-datenbank/import/auswertungen/import-eisen-pro-jahr/esv-import-iron-per-year.component';
import { EsvImportEisenComponent } from './components/esv-datenbank/import/auswertungen/import-eisen/esv-import-eisen.component';
import { EsvImportSteelPerYearComponent } from './components/esv-datenbank/import/auswertungen/import-stahl-pro-jahr/esv-import-steel-per-year.component';
import { EsvImportStahlComponent } from './components/esv-datenbank/import/auswertungen/import-stahl/esv-import-stahl.component';
import { EsvMarketEisenComponent } from './components/esv-datenbank/import/auswertungen/markt-eisen/esv-market-eisen.component';
import { EsvMarketStahlComponent } from './components/esv-datenbank/import/auswertungen/markt-stahl/esv-market-stahl.component';
import { EsvYearComponent } from './components/esv-datenbank/import/auswertungen/schnellansicht-jahr/esv-year.component';
import { EsvMonthComponent } from './components/esv-datenbank/import/auswertungen/schnellansicht-monat/esv-month.component';
import { EsvCountrysComponent } from './components/esv-datenbank/import/countrys/esv-countrys.component';
import { EsvMeldungenComponent } from './components/esv-datenbank/import/meldungen/esv-meldungen.component';
import { EsvMenueComponent } from './components/esv-datenbank/import/menue/esv-menue.component';
import { MtglMenueComponent } from './components/esv-datenbank/mitgliedermeldung/menue/mtgl-menue.component';
import { EisenAuswertungComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-eisen/auswertungen/eisen-auswertung.component';
import { EisenDivergenzComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-eisen/auswertungen/eisen-divergenz/eisen-divergenz.component';
import { EisenDivMonatComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-eisen/auswertungen/eisen-divergenz/monat/eisen-div-monat.component';
import { EisenDivQuartalComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-eisen/auswertungen/eisen-divergenz/quartal/eisen-div-quartal.component';
import { EisenExportComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-eisen/auswertungen/eisen-export/eisen-export.component';
import { EisenExportGesamtComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-eisen/auswertungen/eisen-export/export-gesamt/eisen-export-gesamt.component';
import { EisenExportMonatComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-eisen/auswertungen/eisen-export/export-monat/eisen-export-monat.component';
import { EisenExportQuartalComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-eisen/auswertungen/eisen-export/export-quartal/eisen-export-quartal.component';
import { EisenPivotComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-eisen/auswertungen/eisen-pivot/eisen-pivot.component';
import { ReportViewComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-eisen/eisen-meldung-view/report-view.component';
import { EisenMeldungComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-eisen/meldung/eisen-meldung.component';
import { EisenRechnungenComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-eisen/rechnungen/eisen-rechnungen.component';
import { RechnungAComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-eisen/rechnungen/rechnung-a/rechnung-a.component';
import { RechnungBComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-eisen/rechnungen/rechnung-b/rechnung-b.component';
import { StahlAuswertungComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-stahl/auswertungen/stahl-auswertung.component';
import { StahlDivMonatComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-stahl/auswertungen/stahl-divergenz/monat/stahl-div-monat.component';
import { StahlDivQuartalComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-stahl/auswertungen/stahl-divergenz/quartal/stahl-div-quartal.component';
import { StahlDivergenzComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-stahl/auswertungen/stahl-divergenz/stahl-divergenz.component';
import { StahlExportGesamtComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-stahl/auswertungen/stahl-export/export-gesamt/stahl-export-gesamt.component';
import { StahlExportMonatComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-stahl/auswertungen/stahl-export/export-monat/stahl-export-monat.component';
import { StahlExportQuartalComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-stahl/auswertungen/stahl-export/export-quartal/stahl-export-quartal.component';
import { StahlExportComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-stahl/auswertungen/stahl-export/stahl-export.component';
import { StahlPivotComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-stahl/auswertungen/stahl-pivot/stahl-pivot.component';
import { StahlMeldungComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-stahl/meldung/stahl-meldung.component';
import { RechnungAStahlComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-stahl/rechnungen/rechnung-a-stahl/rechnung-a-stahl.component';
import { RechnungBStahlComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-stahl/rechnungen/rechnung-b-stahl/rechnung-b-stahl.component';
import { StahlRechnungenComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-stahl/rechnungen/stahl-rechnungen.component';
import { StahlMeldungViewComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-stahl/stahl-meldung-view/stahl-meldung-view.component';
import { MtglUebersichtComponent } from './components/esv-datenbank/mitgliedermeldung/uebersicht/mtgl-uebersicht.component';
import { FooterComponent } from './components/footer/footer.component';
import { ThirdPartyNoticeComponent } from './components/third-party-notice/third-party-notice.component';
import { UpdateUserComponent } from './components/update-user/update-user.component';
import { UseradministrationComponent } from './components/useradministration/useradministration.component';
import { InfoComponent } from './components/info/info.component';
import { FlashMessagesComponent } from './components/flash-messages/flash-messages.component';
import { HelperService } from './services/helperServices/helper.service';
import { EsvDataService } from './services/esvImportServices/esv-data.service';
import { EsvCountryService } from './services/esvImportServices/esvCountry.service';
import { ReportService } from './services/esvStatistikServices/report.service';
import { MemberService } from './services/esvStatistikServices/member.service';

@NgModule({
  declarations: [
    FlashMessagesComponent,
    AppComponent,
    NavbarComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    DashboardComponent,
    ProfileComponent,
    FooterComponent,
    UseradministrationComponent,
    UpdateUserComponent,
    EsvMenueComponent,
    EsvMeldungenComponent,
    EsvAuswertungenComponent,
    EsvMonthComponent,
    EsvYearComponent,
    EsvMarketEisenComponent,
    EsvMarketStahlComponent,
    EsvImportStahlComponent,
    EsvImportEisenComponent,
    EsvCountrysComponent,
    MtglUebersichtComponent,
    MtglMenueComponent,
    EsvImportIronPerYearComponent,
    EsvImportSteelPerYearComponent,
    ThirdPartyNoticeComponent,
    EisenMeldungComponent,
    EisenAuswertungComponent,
    EisenRechnungenComponent,
    StahlMeldungComponent,
    StahlAuswertungComponent,
    StahlRechnungenComponent,
    EisenPivotComponent,
    EisenDivergenzComponent,
    EisenExportComponent,
    ReportViewComponent,
    EisenExportMonatComponent,
    EisenExportQuartalComponent,
    EisenExportGesamtComponent,
    StahlMeldungViewComponent,
    RechnungAComponent,
    RechnungBComponent,
    StahlDivergenzComponent,
    StahlPivotComponent,
    EisenDivQuartalComponent,
    EisenDivMonatComponent,
    StahlDivMonatComponent,
    StahlDivQuartalComponent,
    StahlExportComponent,
    StahlExportGesamtComponent,
    StahlExportMonatComponent,
    StahlExportQuartalComponent,
    RechnungAStahlComponent,
    RechnungBStahlComponent,
    InfoComponent,
  ],
  imports: [
    RouterModule,
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [
    ValidateService, 
    AuthService,
    FlashMessageService,
    HelperService,
    EsvDataService,
    EsvCountryService,
    ReportService,
    MemberService,
    AuthGuard,
    AdminGuard, 
    User,
  ],
  bootstrap: [
    AppComponent, 
  ]
})
export class AppModule { }