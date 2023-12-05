import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/authenticationServices/auth.service';
import { NavigationExtras, Router } from '@angular/router';
import { User } from '../../models/user.model';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { FlashMessageService } from '../../services/flashMessageServices/flash-message.service';

@Component({
  selector: 'app-useradministration',
  templateUrl: './useradministration.component.html',
  styleUrls: ['./useradministration.component.css']
})
export class UseradministrationComponent implements OnInit, OnDestroy{

  listOfUsers: any;
  userToDelete: any;

  private subscriptions: Subscription[] = [];

  constructor(private authService:AuthService, private router:Router, private flashMessage: FlashMessageService, private titleService: Title) {
    this.titleService.setTitle('ESV - Benutzerverwaltung');
  }

  ngOnInit(): void {
    this.loadUserList();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  secondConfirm(username: String){
    this.userToDelete = username;
    document.getElementById("secondConfirm")!.style.display = "inline";
  }

  abortConfirm(){
    this.userToDelete = "(no user chosen)";
    document.getElementById("secondConfirm")!.style.display = "none";
  }

  // Löscht einen Benutzer anhand seiner E-Mail Adresse
  deleteUser(username: String){
    this.abortConfirm();

    if(this.authService.getUser().username == username){
      return this.flashMessage.show("Sie können sich nicht selber löschen!", {cssClass: 'alert-danger', timeout: 5000});
    }

    const subscription = this.authService.sendUserDeleteReq(username).subscribe(data => {
      if(data.success){
        this.loadUserList();
        this.flashMessage.show(data.msg, {cssClass: 'alert-success', timeout: 5000});
      }else{
        this.flashMessage.show(data.msg, {cssClass: 'alert-danger', timeout: 5000});
      }
    });
    this.subscriptions.push(subscription);
  }

  // Läd eine Liste aller Benutzer der Applikation für die Darstellung in der Nutzerverwaltung
  loadUserList(){
    const subscription = this.authService.getUsers().subscribe(data => {
      if(data.success){
        this.listOfUsers = data.userList;
      }
    });
    this.subscriptions.push(subscription);
  }

  // Leitet weiter zu "Edit-User" zusammen mit dem gewählten User Objekt
  goToEditUser(user: User){
    if(user.isAdmin == undefined){
      user.isAdmin = false;
    }
    let navigationExtras: NavigationExtras = {
      queryParams: {
        "user": JSON.stringify(user)
      }
    };
    this.router.navigate(['useradministration/editUser'], navigationExtras);
  }
}