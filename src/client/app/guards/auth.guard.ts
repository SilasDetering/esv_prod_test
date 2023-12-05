import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../services/authenticationServices/auth.service';
import { FlashMessageService } from '../services/flashMessageServices/flash-message.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router, private flashMessage: FlashMessageService) { }

    // Prüft für den Zugriff auf gesicherte Seiten ob der Nutzer eingeloggt ist. Falls nicht eingeloggt wird auf die Login Seite umgeleitet 
    canActivate(): boolean {
        if (this.authService.isLoggedIn()) {
            return true;
        } else {
            this.router.navigate(['/login']);
            return false;
        }
    }
}