/**
 * auth.service kommuniziert mit dem Server zur registrierung, authentifizierung und login-Caching.
*/

import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from '../../models/user.model';
import { Subscription } from 'rxjs';
import { environment } from 'src/client/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  authToken: any;
  user: any;
  
  SERVER_URL = `${environment.apiURL}/users`;

  private subscriptions: Subscription[] = [];

  constructor(private http: HttpClient) { }
  helper = new JwtHelperService();

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  // Läd das Token access_token aus dem Local Storage
  loadToken() {
    const token = localStorage.getItem('access_token');
    this.authToken = token;
  }

  // Läd aktuellen User aus dem Local Storage
  loadUser() {
    const user = localStorage.getItem('user');
    this.user = user
  }

  // Gibt das Userobjekt im Local Storage zurück
  getUser() {
    this.loadUser();
    return this.user;
  }

  // Gibt zurück ob der aktuelle Benutzer Administrationsrechte besitzt
  isAdmin() {
    this.loadUser();
    return JSON.parse(this.user).isAdmin
  }

  // Speichert das Anmelde-Token im Local Storage des Clients, damit die Anmeldung nach dem Login verifiziert werden kann.
  storeUserData(token: string, user: any) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('access_token', token);
    this.authToken = token;
    this.user = user;
  }

  // Übergibt ein User-Objekt zum registrieren an den Server
  registerUser(user: User) {
    this.loadToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.authToken
    });
    return this.http.post<Response>(this.SERVER_URL+'/register', user, { headers: headers })
  }

  // Übergibt ein User-Objekt zum authentifizieren an den Server
  authenticateUser(user: { username: String | undefined; password: String | undefined; }) {
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return this.http.post<Response>(this.SERVER_URL+'/authenticate', user, { headers: headers })
  }

  // GET-Req mit Auth-Token an den Server um den aktuellen User zurückzuerhalten
  getProfile() {
    this.loadToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.authToken
    });
    return this.http.get<Response>(this.SERVER_URL+'/profile', { headers: headers })
  }

  // Prüft ob das Token im Lokal Storage des Browsers abgelaufen ist
  isLoggedIn() {
    this.loadToken();
    if ( this.authToken == null || this.helper.isTokenExpired(this.authToken) ) {
      return false;
    }
    return true;
  }

  // Löscht das Anmelde-Token aus dem Local Storage des Clients
  logout() {
    this.authToken = null;
    this.user = null;
    localStorage.clear();
  }

  // Teilt dem Server mit das ein bestimmter User gelöscht werden soll:
  sendUserDeleteReq(userID: String) {
    this.loadToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.authToken
    });
    return this.http.delete<Response>(this.SERVER_URL+'/deleteUser/' + userID, { headers: headers })
  }

  // Sendet neue Userdaten zum überschreiben alter Userdaten an den Server
  editUser(user: any) {
    this.loadToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.authToken
    });
    return this.http.put<Response>(this.SERVER_URL+'/editUser', user, { headers: headers })
  }

  // Sendet neues Password zum bearbeiten des alten PW an den Server
  editPassword(newPwReq: any) {
    this.loadToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.authToken
    });
    return this.http.put<Response>(this.SERVER_URL+'/editPassword', newPwReq, { headers: headers })
  }

  // Ruft eine Liste alle aktuellen User vom Server ab
  getUsers() {
    this.loadToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.authToken
    });
    return this.http.get<Response>(this.SERVER_URL+'/getUserList', { headers: headers })
  }
}

// Interface als Model für die Rückgabeparameter des Servers
export interface Response {
  user: any
  token: string
  success: boolean
  msg: string
  userList: any[]
}