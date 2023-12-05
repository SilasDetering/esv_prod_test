import { Component, OnDestroy, OnInit } from '@angular/core';
import { ValidateService } from '../../services/authenticationServices/validate.service';
import { AuthService } from '../../services/authenticationServices/auth.service';
import { ActivatedRoute, Router } from '@angular/router'
import { Subscription } from 'rxjs';
import { FlashMessageService } from '../../services/flashMessageServices/flash-message.service';

@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.css']
})
export class UpdateUserComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];

  constructor(
    private validateService: ValidateService,
    private flashMessage: FlashMessageService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  // Benutzer der Bearbeitet werden soll
  user: any;
  
  // Zustände für HTML
  changePW: boolean = false;
  bearbeiten: boolean = false;
  showPwRequirements: boolean = false; 

  // Benutzerdaten zum bearbeiten (Kopie von "user")
  firstName: string | undefined;
  lastName: string | undefined;
  username: string | undefined;
  email: string | undefined;
  isAdmin: boolean | undefined;
  password: string | undefined;
   
  ngOnInit(): void {
    const subscription = this.route.queryParams.subscribe(params => {
      this.user = JSON.parse(params["user"]);
    })
    this.resetForm();
    this.subscriptions.push(subscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  // Benutzerdaten Ändern
  onEditSubmit() {
    const updateUser = {
      oldUsername: this.user.username,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      username: this.firstName?.toLowerCase() + "." + this.lastName?.toLowerCase(),
      isAdmin: this.isAdmin,
    }

    // Required Fields (prüfen auf leere Felder in validateService)
    if( !this.validateService.validateUpdatedUser(updateUser)){
      this.flashMessage.show('Bitte alle Felder ausfüllen', {cssClass: 'alert-danger', timeout:3000});
      return;
    }

    // Prüft auf gültige EMail Signatur
    if( !this.validateService.validateEmail(updateUser.email)) {
      this.flashMessage.show('Ungültige E-Mail Adresse', { cssClass: 'alert-danger', timeout: 3000 });
      return;
    }
      // Schickt die neuen Daten an den Server
      const subscription = this.authService.editUser(updateUser).subscribe((data) => {
        if (data.success) {
          this.flashMessage.show(data.msg, { cssClass: 'alert-success', timeout: 3000 });
          this.router.navigate(['useradministration']);
        } else {
          this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 3000 });
        }
      });
      this.subscriptions.push(subscription);
  }

  // Password Ändern
  onPasswordSubmit(event: Event){
    event.preventDefault(); // Deaktiviert neu laden nach submit

    document.getElementById("passwordForm")!.className = "form-control";
    const newPasswordReq = {
      username: this.user.username,
      newPassword: this.password,
    }
    
    // Validate Password
    if(!this.validateService.validatePassword(newPasswordReq.newPassword)){
      this.showPwRequirements = true;
      document.getElementById("passwordForm")!.className = "form-control is-invalid";
    } else {
      // Send new Password to Server
      const subscription = this.authService.editPassword(newPasswordReq).subscribe((data) => {
        if (data.success) {
          this.router.navigate(['useradministration']);
          this.flashMessage.show(data.msg, { cssClass: 'alert-success', timeout: 3000 });
        } else {
          this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 3000 });
        }
      });
      this.subscriptions.push(subscription);
    }
  }

  // Setzt den Inhalt des Formulars auf den Ursprungswert zurück
  resetForm() {
    if (this.user == undefined || !this.user) {
      this.flashMessage.show('Beim laden des ausgewählten Benutzers ist ein Fehler aufgetreten', { cssClass: 'alert-danger', timeout: 3000 });
    } else {
      this.firstName = this.user.firstName;
      this.lastName = this.user.lastName;
      this.username = this.user.username;
      this.email = this.user.email;
      this.isAdmin = this.user.isAdmin;
    }
  }
}