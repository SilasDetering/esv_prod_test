/*
 * Stellt die Navigationsleiste für alle Seiten dar. 
*/

import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../services/authenticationServices/auth.service';
import { Router } from '@angular/router';
import { FlashMessageService } from '../../services/flashMessageServices/flash-message.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  user: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private flashMessage: FlashMessageService,
  ) { }

  ngOnInit(): void {
    this.user = JSON.parse(this.authService.getUser());
  }

  // Prüft ob der User eingeloggt ist, damit dementsprechent die passenden Header-Reiter angezeigt werden können
  userIsLoggedIn(): boolean{
    return this.authService.isLoggedIn();
  }

  // Prüft ob User Administrative Rechte besitzt
  userIsAdmin(): boolean{
    return this.authService.isAdmin();
  }
  
  // Logged den User beim clicken auf "Logout" aus und gibt eine Statusmeldung zurück
  onLogoutClick(){
    this.authService.logout();
    this.flashMessage.show('Du wurdest ausgeloggt', {cssClass:'alert-success', timeout: 5000});
    this.router.navigate(['/home']);
    return false;
  }
}