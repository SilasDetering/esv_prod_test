/*
  Dashboard Seite von VDD. Erste Übersicht nach dem Login
*/

import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/authenticationServices/auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  currentUser: any;
  username: any; 

  constructor(private authService: AuthService, private titleService: Title) {
    this.titleService.setTitle('ESV - Datenbank');
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(this.authService.getUser());
    this.username = this.currentUser.username;
  }

  // Prüft ob User Administrative Rechte besitzt
  userIsAdmin(): boolean {
    return this.authService.isAdmin();
  }

}
