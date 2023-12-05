/*
  Profil Seite von VDD für die Ansicht des eigenen Profils
*/
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/authenticationServices/auth.service';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';
import { Subscription } from 'rxjs';
import { FlashMessageService } from '../../services/flashMessageServices/flash-message.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {

  user: User | undefined;
  private subscriptions: Subscription[] = [];

  constructor(private authService:AuthService, private router:Router, private flashMessage: FlashMessageService) { }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  ngOnInit() {
    const subscription = this.authService.getProfile().subscribe( data => {
        if(!data.success){
          this.flashMessage.show("Fehler beim Laden des Benutzerkontos", { cssClass: 'alert-danger', timeout: 5000 });
        } else {
          this.user = data.user
        }
      }
    )
    this.subscriptions.push(subscription);
  }
}