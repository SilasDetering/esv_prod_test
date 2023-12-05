/**
 * member.service kommuniziert mit dem Server bzgl. aller Mitglieder bezogenen Anfragen
*/

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Member } from '../../models/member.model';
import { AuthService } from '../authenticationServices/auth.service';
import { environment } from 'src/client/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MemberService {

  constructor(private http: HttpClient, private authService: AuthService) { }

  serverURL = `${environment.apiURL}/members`;

  // Läd eine Liste aller Mitglieder vom Server
  getListOfMembers() {
    this.authService.loadToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.authService.authToken
    });
    return this.http.get<MemberResponse>(this.serverURL + '/getMemberList', { headers: headers })
  }

  // Fügt ein neues Mitglied in die Liste der Mitglieder hinzu
  addMember(newMember: Member) {
    this.authService.loadToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.authService.authToken
    });
    return this.http.post<MemberResponse>(this.serverURL + '/addMember', newMember, { headers: headers })
  }

  // Löscht ein Mitglied aus der Lister der Mitglieder
  deleteMember(member: Member) {
    this.authService.loadToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.authService.authToken
    });
    return this.http.delete<MemberResponse>('http://localhost:3000/members/deleteMember/' + member.ID, { headers: headers })
  }

  // Läd alle Member einer Gruppe passend zu einem gewählten Member vom Server
  getGroupMembersByMember(member: Member) {
    this.authService.loadToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.authService.authToken
    });
    return this.http.get<MemberResponse>(this.serverURL + '/MembersOfGroup/'+ member.group, { headers: headers })
  }
}

export interface MemberResponse {
  success: boolean
  msg: string
  memberList: Member[]
}