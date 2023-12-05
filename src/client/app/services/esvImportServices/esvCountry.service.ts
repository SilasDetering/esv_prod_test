/**
 * esvCountry.service kommuniziert mit dem Server bzgl. aller ESV-Country bezogenen Anfragen
*/

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../authenticationServices/auth.service';
import { Country } from '../../models/country.model';
import { environment } from 'src/client/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EsvCountryService {

  constructor(private http: HttpClient, private authService: AuthService) { }

  SERVER_URL = `${environment.apiURL}/countries`;

  // Läd eine Liste alle Länder vom Server
  getListOfCountries(filter: string){
    this.authService.loadToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.authService.authToken
    });
    return this.http.get<Response>(this.SERVER_URL+'/getCountryList/'+filter, {headers: headers})
  }

  // Fügt ein neues Land in die Liste der Länder hinzu
  addCountry(newCountry: Country){
    this.authService.loadToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.authService.authToken
    });
    return this.http.post<Response>(this.SERVER_URL+'/addCountry', newCountry, {headers: headers})
  }

  // Löscht ein Land aus der Lister der Länder
  deleteCountry(country: Country){
    this.authService.loadToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.authService.authToken
    });
    return this.http.delete<Response>(this.SERVER_URL+'/deleteCountry/'+country.countryID, {headers: headers})
  }
}

export interface Response{
  success: boolean
  msg: string
  countryList: Country[]
}