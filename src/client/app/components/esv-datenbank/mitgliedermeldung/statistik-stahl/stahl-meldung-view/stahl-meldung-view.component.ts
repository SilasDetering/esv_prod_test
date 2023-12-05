import { Component, OnInit } from '@angular/core';
import { HelperService } from 'src/client/app/services/helperServices/helper.service';
import { SteelReport } from 'src/client/app/models/report.model';
import { FlashMessageService } from 'src/client/app/services/flashMessageServices/flash-message.service';

@Component({
  selector: 'app-stahl-meldung-view',
  templateUrl: './stahl-meldung-view.component.html',
  styleUrls: ['./stahl-meldung-view.component.css']
})
export class StahlMeldungViewComponent implements OnInit {

  constructor(private helper: HelperService, private flashMessage: FlashMessageService ) { 
  }

  ngOnInit(){
    if(history.state.selectedReport){
      this.selectedReport = history.state.selectedReport;
    }

    if(this.selectedReport.companyID == ""){
      this.flashMessage.show("Es wurde keine Meldung ausgewählt", { cssClass: 'alert-danger', timeout: 5000 });
    }
  }

  selectedReport: SteelReport = SteelReport.emptySteelReport()

  europeFormat(date: string){
    return this.helper.getDateString(date);
  }

}

