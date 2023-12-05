/*
    Login Seite von VDD zum einloggen auf der Seite
*/

import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/authenticationServices/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Subject} from 'rxjs';
import { FlashMessageService } from '../../services/flashMessageServices/flash-message.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  username: String | undefined;
  password: String | undefined;
  
  isUserLoggedIn: boolean = false;
  private readonly _destroy = new Subject<void>();

  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private flashMessage: FlashMessageService,
  ) { }

  ngOnInit(): void {
    // Leitet den User auf das Dashboard weiter falls dieser schon angemeldet ist
    if(this.authService.isLoggedIn()){
      this.router.navigate(['dashboard']);
    }
  }

  ngOnDestroy(): void {
    this._destroy.next(undefined);
    this._destroy.complete;
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  // Login Button für standart login: 
  onLoginSubmit(){

    // User Model für Login
    const user = {
      username: this.username,
      password: this.password
    }

    if (user.username == undefined || user.password == undefined) {
      //this.flashMessage.show("Bitte füllen Sie beide Felder aus!", { cssClass: 'alert-danger', timeout: 5000 });
    } else {

      // Kommuninkation mittels Observer mit dem Server 
      const subscription = this.authService.authenticateUser(user).subscribe(data => {
        if (data.success) {
          // Token und User Objekt im Local Storage speichern
          this.authService.storeUserData(data.token, data.user);
          this.flashMessage.show('Du bist nun eingelogt', { cssClass: 'alert-success', timeout: 5000 });
          this.router.navigate(['hauptmenue']);
        } else {
          this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 5000 });
          this.router.navigate(['login']);
        }
      });
      this.subscriptions.push(subscription);
    }
  }

  // Mit Microsoft Anmelden
  onMicrosoftLoginSubmit(){
    this.flashMessage.show('Anmelden über Microsoft derzeit nicht möglich', {cssClass: 'alert-warning', timeout: 5000});
  }

  logout(){
    //this.msalService.logoutRedirect({postLogoutRedirectUri: environment.postLogoutUrl});
  }
}