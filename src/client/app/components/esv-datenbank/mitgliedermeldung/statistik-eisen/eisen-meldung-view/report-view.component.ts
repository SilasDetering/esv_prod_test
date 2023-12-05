import { Component, OnInit } from '@angular/core';
import { IronReport } from 'src/client/app/models/report.model';
import { HelperService } from 'src/client/app/services/helperServices/helper.service';

@Component({
  selector: 'app-report-view',
  templateUrl: './report-view.component.html',
  styleUrls: ['./report-view.component.css']
})
export class ReportViewComponent implements OnInit {

  constructor(private helper: HelperService) { 
  }

  ngOnInit(){
    if(history.state.selectedReport){
      this.selectedReport = history.state.selectedReport;
    }
  }

  selectedReport: IronReport = IronReport.emptyIronReport()

  europeFormat(date: string){
    return this.helper.getDateString(date);
  }

}
