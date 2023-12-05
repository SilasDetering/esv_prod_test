/*
    Componente zur Registrierung eines Benutzers.
    Der Benutzer registriert sich mit Vorname, Nachname, Email und Password. Der Benutzername ergibt sich aus Vor- und Nachnamen.
    Die User-Daten werden auf Pflichtfelder und korrekte E-Mail Signatur vom Service "validate.service.ts" geprüft.
*/

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ValidateService } from '../../services/authenticationServices/validate.service';
import { AuthService } from '../../services/authenticationServices/auth.service';
import { Router } from '@angular/router'
import { Subscription } from 'rxjs';
import { FlashMessageService } from '../../services/flashMessageServices/flash-message.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
  
  constructor(
    private validateService: ValidateService, 
    private flashMessage: FlashMessageService,
    private authService: AuthService,
    private router: Router,
  ) { }

  private subscriptions: Subscription[] = [];
  
  showPwRequirements: boolean = false;

  firstName: string | undefined;
  lastName: string | undefined;
  username: string | undefined;
  email: string | undefined;
  password: string | undefined;
  isAdmin: boolean | undefined;

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onRegisterSubmit(){

    // User Objekt zur validierung und eintragung in die DB
    const user = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      username: this.firstName?.toLowerCase() + "." + this.lastName?.toLowerCase(),
      password: this.password,
      isAdmin: this.isAdmin
    }

    // Required Fields (prüfen auf leere Felder in validateService)
    if( !this.validateService.validateRegister(user)){
      this.flashMessage.show('Bitte alle Felder ausfüllen', {cssClass: 'alert-danger', timeout:5000});
      return false;
    }

    // Validate E-Mail (prüfen auf korrekte Signatur in validateService)
    if( !this.validateService.validateEmail(user.email) ){
      this.flashMessage.show('Ungültige E-Mail Adresse', {cssClass: 'alert-danger', timeout:5000});
      document.getElementById("emailField")!.className = "form-control is-invalid";
      return false;
    }

    // isAdmin checkbox bei false definieren (checkbox gibt undefined aus wenn nicht aktiviert)
    if(this.isAdmin == undefined){
      user.isAdmin = false;
    }

    // Password validieren
    if( !this.validateService.validatePassword(user.password)){
      this.showPwRequirements = true;
      document.getElementById("passwordForm")!.className = "form-control is-invalid";
      return false;
    }
    
    // Register User (Gibt User_Daten an authService zur Registrierung weiter und meldet Status zurück)
    const subscription = this.authService.registerUser(user).subscribe( (data) => {
      if(data.success){
        this.flashMessage.show('Benutzer wurde erfolgreich registriert', {cssClass: 'alert-success', timeout:3000});
        this.router.navigate(['/useradministration']);
      }else{
        this.flashMessage.show(data.msg, {cssClass: 'alert-danger', timeout:3000});
        this.router.navigate(['/register']);
      }
    });
    this.subscriptions.push(subscription);

    return true
  }  
}
