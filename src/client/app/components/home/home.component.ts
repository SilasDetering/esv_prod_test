/*
    Home Seite von VDD. 
*/

import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/authenticationServices/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    private authService: AuthService,
  ) { }

  // Prüft ob der User eingeloggt ist, damit dementsprechent die passenden Header-Reiter angezeigt werden können
  userIsLoggedIn(): boolean{
    return this.authService.isLoggedIn();
  }

  ngOnInit(): void {
  }

}