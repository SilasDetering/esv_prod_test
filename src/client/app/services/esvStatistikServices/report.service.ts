import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../authenticationServices/auth.service';
import { Member } from '../../models/member.model';
import { IronReport, SteelReport } from '../../models/report.model';
import { environment } from 'src/client/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private http: HttpClient, private authService: AuthService) {
    this.authService.loadToken();
  }

  private authHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + this.authService.authToken
  });

  private serverURL = `${environment.apiURL}/reports`;

  /* ============================   EISEN   ============================ */

  // Läd eine Liste aller Eisenmeldungen als Übersicht vom Server
  getListOfIronReports() {
    return this.http.get<IronResponse>(this.serverURL + '/iron/getListOfIronReport', { headers: this.authHeaders })
  }

  // Läd eine Liste aller Eisenmeldungen als Übersicht vom Server. Liste wird gefiltert nach companyID und reportDate
  getFilteredListOfIronReports(companyIDList: Array<string>, reportDateList: Array<string>) {
    return this.http.post<IronResponse>(this.serverURL + '/iron/getFilteredListOfIronReport', { ids: companyIDList, dates: reportDateList }, { headers: this.authHeaders })
  }

  // Läd alle Eisenmeldungen von einem Gewünscheten Jahr und dem Vorjahr für die Divergenz Ansicht vom Server. Jeweils vom ersten Monat bis zu einem gewählten Monat.
  getIronReportsUntilDate(date: string) {
    return this.http.get<IronResponse>(this.serverURL + '/iron/getIronReportsUntilDate/'+date, { headers: this.authHeaders })
  }

  // Läd alle Daten der Eisenmeldungen vom Server
  getIronReportDates() {
    return this.http.get<IronResponse>(this.serverURL + '/iron/getIronReportDates', { headers: this.authHeaders })
  }

  // Läd alle Eisenmeldungen von einem gewünscheten Jahr
  getIronReportsByYear(year: string) {
    return this.http.get<IronResponse>(this.serverURL + '/iron/getIronReportsByYear/' + year, { headers: this.authHeaders })
  }

  // Läd alle Eisenmeldungen von einem gewünscheten Monat
  getIronReportsByDate(reportDate: string) {
    return this.http.get<IronResponse>(this.serverURL + '/iron/getIronReportByDate/' + reportDate, { headers: this.authHeaders })
  }

  // Fügt eine neue Eisenmeldung in die Liste der Meldungen hinzu
  addIronReport(newIronReport: IronReport) {
    return this.http.post<IronResponse>(this.serverURL + '/iron/addIronReport', newIronReport, { headers: this.authHeaders })
  }

  // Löscht eine Eisenmeldung aus der Lister der Meldungen
  deleteIronReport(report: IronReport) {
    return this.http.post<IronResponse>(this.serverURL + '/iron/deleteIronReport', report, { headers: this.authHeaders })
  }

  // Läd alle Eisenmeldungen von einem gewünscheten Mitglied oder Gruppe und dem gewünschten Jahr
  getIronReportsByGroupAndDate(member: Member, date: string) {
    return this.http.post<IronResponse>(this.serverURL + '/iron/getGroupReports', {member: member, date: date}, { headers: this.authHeaders })
  }

  /* ============================   STAHL   ============================ */

  // Läd eine Liste aller Stahlmeldungen als Übersicht vom Server
  getListOfSteelReports() {
    return this.http.get<SteelResponse>(this.serverURL + '/steel/getListOfSteelReport', { headers: this.authHeaders })
  }

  // Läd eine Liste aller Stahlmeldungen als Übersicht vom Server. Liste wird gefiltert nach companyID und reportDate
  getFilteredListOfSteelReports(companyIDList: Array<String>, reportDateList: Array<String>) {
    return this.http.post<SteelResponse>(this.serverURL + '/steel/getFilteredListOfSteelReport', { ids: companyIDList, dates: reportDateList }, { headers: this.authHeaders })
  }

  // Läd alle Stahlmeldungen von einem Gewünscheten Jahr und dem Vorjahr für die Divergenz Ansicht vom Server. Jeweils vom ersten Monat bis zu einem gewählten Monat.
  getSteelReportsUntilDate(date: String) {
    return this.http.get<SteelResponse>(this.serverURL + '/steel/getSteelReportsUntilDate/' + date, { headers: this.authHeaders })
  }

  // Läd alle Daten der Stahlmeldungen vom Server
  getSteelReportDates() {
    return this.http.get<SteelResponse>(this.serverURL + '/steel/getSteelReportDates', { headers: this.authHeaders })
  }

  // Läd alle Stahlmeldungen von einem gewünscheten Jahr
  getSteelReportsByYear(year: String) {
    return this.http.get<SteelResponse>(this.serverURL + '/steel/getSteelReportsByYear/' + year, { headers: this.authHeaders })
  }

  getSteelReportsByDate(reportDate: String) {
    return this.http.get<SteelResponse>(this.serverURL + '/steel/getSteelReportByDate/' + reportDate, { headers: this.authHeaders })
  }

  // Fügt eine neue Stahlmeldung in die Liste der Meldungen hinzu
  addSteelReport(newSteelReport: SteelReport) {
    return this.http.post<SteelResponse>(this.serverURL + '/steel/addSteelReport', newSteelReport, { headers: this.authHeaders })
  }

  // Löscht eine Stahlmeldung aus der Lister der Meldungen
  deleteSteelReport(report: SteelReport) {
    return this.http.post<SteelResponse>(this.serverURL + '/steel/deleteSteelReport', report, { headers: this.authHeaders })
  }

  // Läd alle Stahlmeldungen von einem gewünscheten Mitglied oder Gruppe und dem gewünschten Jahr
  getSteelReportsByGroupAndDate(member: Member, date: string) {
    return this.http.post<SteelResponse>(this.serverURL + '/steel/getGroupReports', {member: member, date: date}, { headers: this.authHeaders })
  }
}

export interface IronResponse {
  success: boolean
  msg: string
  reportList: IronReport[]
}

export interface SteelResponse {
  success: boolean
  msg: string
  reportList: SteelReport[]
}