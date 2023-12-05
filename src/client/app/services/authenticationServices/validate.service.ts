/**
 * validate.service bietet Services für die validierung der Eingabefelder und der E-Mail Signatur
*/

import { Injectable } from '@angular/core';
import { User, UpdateUser } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ValidateService {

  constructor() { }

  // Prüft auf leere Felder im Registierungsformular
  validateRegister(user: User | undefined){
    if(user == undefined) return false;
    if(user.lastName == undefined || user.firstName == undefined || user.email == undefined || user.username == undefined || user.password == undefined){
      return false;
    } else if(user.lastName.length > 10 || user.firstName.length > 10){
      return false;
    } else {
      return true;
    }
  }

  // Validiert Felder im Formular für das updateUser-Formular
  validateUpdatedUser(user: UpdateUser | undefined){
    if(user == undefined) return false;
    if(user.lastName == undefined || user.firstName == undefined || user.email == undefined || user.username == undefined || user.oldUsername == undefined){
      return false;
    } else if(user.lastName.length > 10 || user.firstName.length > 10){
      return false;
    } else {
      return true;
    }
  }

  // Prüft eine E-Mail auf eine gültige Signatur
  validateEmail(email: string | undefined){
    if(email == undefined) return false;
    const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return re.test(email);
  }

  // Prüft Passwort auf gültigkeit (min. 8 Zeichen, Zahl, große- und kleine Buchstaben)
  validatePassword(password: string | undefined){
    if(password == undefined) return false;
    var requirement = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,20}$/;
    return password.match(requirement);
  }
}