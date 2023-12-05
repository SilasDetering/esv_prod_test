import { NgModule } from '@angular/core';
import { InitialNavigation, RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EsvAuswertungenComponent } from './components/esv-datenbank/import/auswertungen/esv-auswertungen.component';
import { EsvCountrysComponent } from './components/esv-datenbank/import/countrys/esv-countrys.component';
import { EsvMeldungenComponent } from './components/esv-datenbank/import/meldungen/esv-meldungen.component';
import { EsvMenueComponent } from './components/esv-datenbank/import/menue/esv-menue.component';
import { MtglMenueComponent } from './components/esv-datenbank/mitgliedermeldung/menue/mtgl-menue.component';
import { EisenAuswertungComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-eisen/auswertungen/eisen-auswertung.component';
import { ReportViewComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-eisen/eisen-meldung-view/report-view.component';
import { EisenMeldungComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-eisen/meldung/eisen-meldung.component';
import { EisenRechnungenComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-eisen/rechnungen/eisen-rechnungen.component';
import { StahlAuswertungComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-stahl/auswertungen/stahl-auswertung.component';
import { StahlMeldungComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-stahl/meldung/stahl-meldung.component';
import { StahlRechnungenComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-stahl/rechnungen/stahl-rechnungen.component';
import { StahlMeldungViewComponent } from './components/esv-datenbank/mitgliedermeldung/statistik-stahl/stahl-meldung-view/stahl-meldung-view.component';
import { MtglUebersichtComponent } from './components/esv-datenbank/mitgliedermeldung/uebersicht/mtgl-uebersicht.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { RegisterComponent } from './components/register/register.component';
import { ThirdPartyNoticeComponent } from './components/third-party-notice/third-party-notice.component';
import { UpdateUserComponent } from './components/update-user/update-user.component';
import { UseradministrationComponent } from './components/useradministration/useradministration.component';
import { AdminGuard } from './guards/admin.guard';
import { AuthGuard } from './guards/auth.guard';
import { InfoComponent } from './components/info/info.component';

// Routing
const routes: Routes = [
  // Allgemein
  {path:'', component: HomeComponent},
  {path:'home', component: HomeComponent},
  {path:'hauptmenue', component: DashboardComponent, canActivate:[AuthGuard]},  
  {path:'third-party-notice', component: ThirdPartyNoticeComponent},
  {path:'info', component: InfoComponent},

  // Autherntication & Benutzerverwaltung
  {path:'login', component: LoginComponent},
  {path:'profile', component: ProfileComponent, canActivate:[AuthGuard]},
  {path:'useradministration', component: UseradministrationComponent, canActivate:[AuthGuard, AdminGuard]},
  {path:'useradministration/register', component: RegisterComponent, canActivate:[AuthGuard, AdminGuard]},
  {path:'useradministration/editUser', component: UpdateUserComponent, canActivate:[AuthGuard, AdminGuard]},

  // ESV IMPORTE
  {path:'esv-import', component: EsvMenueComponent, canActivate:[AuthGuard]},
  {path:'esv-import/meldungen', component: EsvMeldungenComponent, canActivate:[AuthGuard]},
  {path:'esv-import/auswertungen', component: EsvAuswertungenComponent, canActivate:[AuthGuard]},
  {path:'esv-import/laender', component: EsvCountrysComponent, canActivate:[AuthGuard]},
  
  // ESV MITGLIEDER STATISTIK
  {path:'esv-statistik', component: MtglMenueComponent, canActivate:[AuthGuard]},
  {path:'esv-statistik/menue/:statType', component: MtglMenueComponent, canActivate:[AuthGuard]},
  {path:'esv-statistik/mitglieder', component: MtglUebersichtComponent, canActivate:[AuthGuard]},
  {path:'esv-statistik/eisen-meldung', component: EisenMeldungComponent, canActivate:[AuthGuard]},
  {path:'esv-statistik/eisen-auswertung', component: EisenAuswertungComponent, canActivate:[AuthGuard]},
  {path:'esv-statistik/eisen-rechnung', component: EisenRechnungenComponent, canActivate:[AuthGuard]},
  {path:'esv-statistik/stahl-meldung', component: StahlMeldungComponent, canActivate:[AuthGuard]},
  {path:'esv-statistik/stahl-auswertung', component: StahlAuswertungComponent, canActivate:[AuthGuard]},
  {path:'esv-statistik/stahl-rechnung', component: StahlRechnungenComponent, canActivate:[AuthGuard]},
  {path:'esv-statistik/eisen-meldung/report-view', component: ReportViewComponent, canActivate:[AuthGuard]},
  {path:'esv-statistik/stahl-meldung/report-view', component: StahlMeldungViewComponent, canActivate:[AuthGuard]},
]

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabled' as InitialNavigation,
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
