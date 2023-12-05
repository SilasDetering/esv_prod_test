import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../services/authenticationServices/auth.service';
import { FlashMessageService } from '../services/flashMessageServices/flash-message.service';

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router, private flashMessage: FlashMessageService) { }

    // Prüft ob der Benutzer Admin Rechte besitzt wenn dieser auf eine geschützte Seite zugreifen möchte
    canActivate(): boolean {
        if (this.authService.isAdmin()) {
            return true;
        } else {
            this.router.navigate(['/home']);
            this.flashMessage.show("Du bist nicht berechtigt diese Seite aufzurufen", { cssClass: 'alert-danger', timeout: 5000 });
            return false;
        }
    }
}