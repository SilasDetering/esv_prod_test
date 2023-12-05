import { Component, OnDestroy, OnInit } from '@angular/core';
import { CsvConverterService } from '../../../../services/esvImportServices/csv-converter.service';
import { EsvDataService } from 'src/client/app/services/esvImportServices/esv-data.service';
import { MonthStats } from 'src/client/app/models/importData.model';
import { HelperService } from 'src/client/app/services/helperServices/helper.service';
import { Subscription } from 'rxjs';
import { FlashMessageService } from 'src/client/app/services/flashMessageServices/flash-message.service';

@Component({
  selector: 'app-esv-meldungen',
  templateUrl: './esv-meldungen.component.html',
  styleUrls: ['./esv-meldungen.component.css']
})
export class EsvMeldungenComponent implements OnInit, OnDestroy {

  constructor(private csvConverter: CsvConverterService, private flashMessage: FlashMessageService, private esvDataService: EsvDataService, private helper: HelperService) { }

  importToDelete: String = "";
  insertedFile: any;
  listOfLastRep: Array<MonthStats> = [];

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.loadLastImports();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  // Läd eine Liste der vorhandenen Meldungen vom Server
  loadLastImports(){
    const subscription = this.esvDataService.getListOfLastImports().subscribe((data) => {
      if(data.success){
        this.listOfLastRep = data.listOfRep;
      } else {
        this.flashMessage.show("Fehler beim Laden der letzten Meldungen", { cssClass: 'alert-danger', timeout: 5000 });
      }
    })
    this.subscriptions.push(subscription);
  }

  // Speichert die vom File-Input übergebene Datei in insertedFile ab
  handleFileInput($event: any) {
    this.insertedFile = $event.srcElement.files;
  }

  // Prüft ob die eingegebene CSV-Datei und das Datum gültig sind und übergibt diese dann zur weiterverarbeitung an den Service "csvConverter"
  onMeldungHinzufuegen() {
    const dateField = document.getElementById('dateField') as HTMLInputElement;
    const importDate = dateField.value;
    var files = this.insertedFile;

    if(!importDate){
      this.flashMessage.show("Bitte geben Sie das offizielle Datum der Meldung vom statistischen Bundesamts an", { cssClass: 'alert-danger', timeout: 5000 });
    } else if (files == null || !files ) {
      this.flashMessage.show("Es wurde keine CSV-Datei übergeben", { cssClass: 'alert-danger', timeout: 5000 });
    } else if (files[0].type != "text/csv") {
      this.flashMessage.show("Fehler beim einlesen der Datei: Die Datei muss vom Typ CSV sein", { cssClass: 'alert-danger', timeout: 5000 });
    } else {
      this.csvConverter.handleCSVData(files[0], importDate);
    }
  }

  // Löscht einen Datensatz aus der Liste der letzten Importe
  secondConfirm(reportID: String) {
    this.importToDelete = reportID;
    document.getElementById("secondConfirm")!.style.display = "inline";
  }
  abortConfirm() {
    this.importToDelete = "(no report chosen)";
    document.getElementById("secondConfirm")!.style.display = "none";
  }
  deleteImport(date: String) {
    const subscription = 
    this.esvDataService.deleteImportData(date).subscribe((data) => {
      if(data.success){
        this.flashMessage.show("Die Importdaten vom "+ date +" wurden gelöscht", { cssClass: 'alert-success', timeout: 5000 });
        this.abortConfirm()
        this.loadLastImports()
      }else{
        this.flashMessage.show("Fehler beim Löschen der Importdaten", { cssClass: 'alert-danger', timeout: 5000 });
        this.abortConfirm()
      }
    })
    this.subscriptions.push(subscription);
  }

  getWrittenMonth(date: string) {return this.helper.getMonthString(date)}
  getWrittenYear(date: string) {return this.helper.getYearString(date)}
  getWrittenDate(date: string) {return this.helper.getDateString(date)}
}