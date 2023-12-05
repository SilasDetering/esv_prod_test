import { Component, OnDestroy, OnInit } from '@angular/core';
import { Member } from 'src/client/app/models/member.model';
import { MemberService } from 'src/client/app/services/esvStatistikServices/member.service';
import { Subscription } from 'rxjs';
import { FlashMessageService } from 'src/client/app/services/flashMessageServices/flash-message.service';

@Component({
  selector: 'app-mtgl-uebersicht',
  templateUrl: './mtgl-uebersicht.component.html',
  styleUrls: ['./mtgl-uebersicht.component.css']
})
export class MtglUebersichtComponent implements OnInit, OnDestroy {

  listOfMembers: Member[] = [];
  memberToDelete: Member = new Member();
  newMember: Member = new Member();

  private subscriptions: Subscription[] = [];

  constructor(private memberService: MemberService, private flashMessage: FlashMessageService,) { }

  ngOnInit(): void {
    this.loadMemberList();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  // Läd eine Liste aller Mitglieder für die Verwaltung vom Server
  loadMemberList() {
    const subscription = this.memberService.getListOfMembers().subscribe(data => {
      if (data.success) {
        // Parse the data into Member objects
        this.listOfMembers = data.memberList.map(memberData => Member.fromJSON(memberData));
      } else {
        this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 5000 });
      }
    });
    this.subscriptions.push(subscription);
  }

  // Fügt ein neues Mitglied hinzu
  onAddMemberSubmit() {
    // Validiere Eingabe
    if (!this.validateNewMemberData(this.newMember)) {
      this.flashMessage.show("Ungültige Eingabe", { cssClass: 'alert-danger', timeout: 5000 });
      return;
    }

    // REST Request
    const subscription = this.memberService.addMember(this.newMember).subscribe((data) => {
      if (data.success) {
        window.location.reload();
        this.flashMessage.show('Mitglied wurde erfolgreich hinzugefügt', { cssClass: 'alert-success', timeout: 3000 });
      } else {
        this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 3000 });
      }
    });
    this.subscriptions.push(subscription);
  }

  // Validiert die Eingabe für ein neues Mitglied
  validateNewMemberData(newMember: Member): boolean {
    if (newMember.ID == "" || newMember.name == "" || !newMember.debNr) {
      return false;
    } else if (newMember.address.city == "" || newMember.address.street == "" || !newMember.address.zipCode) {
      return false;
    } 
    return true;
  }

  secondConfirm(member: Member) {
    this.memberToDelete = member;
    document.getElementById("secondConfirm")!.style.display = "inline";
  }

  aboardConfirm() {
    this.memberToDelete = new Member();
    document.getElementById("secondConfirm")!.style.display = "none";
  }

  // Löscht ein Mitglied
  deleteMember(member: Member) {
    const subscription = this.memberService.deleteMember(member).subscribe((data) => {
      if (data.success) {
        window.location.reload();
        this.flashMessage.show('Das Mitglied ' + member.name + ' wurde entfernt', { cssClass: 'alert-success', timeout: 3000 });
      } else {
        this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 3000 });
      }
    });
    this.subscriptions.push(subscription);
  }
}
