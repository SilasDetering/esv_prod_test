/**
 * esv-data.service kommuniziert bzgl. der Import-/Reportdaten mit dem Server
*/

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EsvImport, MonthReportList } from '../../models/importData.model';
import { AuthService } from '../authenticationServices/auth.service';
import { environment } from 'src/client/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class EsvDataService {

  constructor(private http: HttpClient, private authService: AuthService) { }

  private serverURL = `${environment.apiURL}/data`;
  private serverURL_reports = `${environment.apiURL}/reports`;

  // Fügt einen neuen Import in die Datenbank ein
  sendImportData(data: EsvImport[]) {
    this.authService.loadToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.authService.authToken
    });
    return this.http.post<Response>(this.serverURL + '/storeImportData', { data: data }, { headers: headers });
  }

  // Läd alle vorhandenen Monatsberichte vom Server
  getListOfLastImports() {
    this.authService.loadToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.authService.authToken
    });
    return this.http.get<MonthReportList>(this.serverURL + '/getMonthlyImportStats/all', { headers: headers });
  }

  // Läd den Monatsbericht eines bestimmten Monats vom Server
  getMonthStats(date: String) {
    this.authService.loadToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.authService.authToken
    });
    return this.http.get<MonthReportList>(this.serverURL + '/getMonthlyImportStats/' + date, { headers: headers });
  }

  // Löscht den zu date passenden Datensatz aus der Datenbank
  deleteImportData(date: String) {
    this.authService.loadToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.authService.authToken
    });
    return this.http.delete<Response>(this.serverURL + '/deleteMonthImport/' + date, { headers: headers });
  }

  // Läd die Import-Summe eines beliebigen Jahres vom Server
  getSpecificYearSum(year: String) {
    this.authService.loadToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.authService.authToken
    });
    return this.http.get<Response>(this.serverURL + '/getYearSum/' + year, { headers: headers });
  }

  // Läd die Import-Summe aller gespeicherten Jahre vom Server
  getYearSum() {
    this.authService.loadToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.authService.authToken
    });
    return this.http.get<Response>(this.serverURL + '/getYearSum/all', { headers: headers });
  }

  // Läd den Monatsdurchschnitt aller vorhandenen Jahre vom Server
  getYearAvgStats() {
    this.authService.loadToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.authService.authToken
    });
    return this.http.get<Response>(this.serverURL + '/getMonthAvgsPerYear', { headers: headers });
  }

  // Läd eine Liste von Importen pro Land eines Monats vom Server
  getImportsPerCountry(date: String) {
    this.authService.loadToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.authService.authToken
    });
    return this.http.get<Response>(this.serverURL + '/getImportsPerCountry/' + date, { headers: headers });
  }

  // Läd eine Liste von Importen pro Land eines Monats vom Server
  getCountryImportsPerYear(date: String) {
    this.authService.loadToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.authService.authToken
    });
    return this.http.get<Response>(this.serverURL + '/getCountryImportsPerYear/' + date, { headers: headers });
  }

  // Läd eine Liste von Eisen innland Versendungen vom Server. Die innland Versendungen kommen von den Mitgliedermeldungen
  getInnerShippingIron() {
    this.authService.loadToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.authService.authToken
    });
    return this.http.get<Response>(this.serverURL_reports + '/iron/getInnlandShippingStatsForIron', { headers: headers });
  }

  // Läd eine Liste von Eisen innland Versendungen vom Server. Die innland Versendungen kommen von den Mitgliedermeldungen
  getInnerShippingSteel() {
    this.authService.loadToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.authService.authToken
    });
    return this.http.get<Response>(this.serverURL_reports + '/steel/getInnlandShippingStatsForSteel', { headers: headers });
  }

  // Berechnet die Monatsstatistik auf dem Server neu
  refreshMonthStats() {
    this.authService.loadToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.authService.authToken
    });
    return this.http.put<Response>(this.serverURL + '/refreshMonthStats', { headers: headers });
  }
}

export interface Response {
  data: any
  success: boolean
  msg: string
}
