import { Component, OnDestroy, OnInit } from '@angular/core';
import { HelperService } from 'src/client/app/services/helperServices/helper.service'
import { EsvDataService } from 'src/client/app/services/esvImportServices/esv-data.service';
import { Subscription } from 'rxjs';
import { MonthStats, YearAvg } from 'src/client/app/models/importData.model';
import { FlashMessageService } from 'src/client/app/services/flashMessageServices/flash-message.service';

@Component({
  selector: 'app-esv-auswertungen',
  templateUrl: './esv-auswertungen.component.html',
  styleUrls: ['./esv-auswertungen.component.css']
})
export class EsvAuswertungenComponent implements OnInit, OnDestroy {

  constructor(
    private helper: HelperService, 
    private dataService: EsvDataService, 
    private flashMessage: FlashMessageService,
    private esvService: EsvDataService
  ) { }

  selectedDate: string = this.helper.getCurrentDateString()
  monthStatsList: Array<MonthStats> = new Array
  yearAvgList: Array<YearAvg> = new Array
  inlandsversandDatenStahl: any[] = new Array
  inlandsversandDatenEisen: any[] = new Array

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.refresh();

    // Event Listener für das Datum-Feld
    const dateInput = document.getElementById("inputDate") as HTMLInputElement
    
    dateInput.addEventListener("change", (event) => {
      try {
        const target = event.target as HTMLInputElement;
        const date = this.helper.normDate(target.value);
        this.selectedDate = date;
        this.refresh();
      } catch (error) {
        console.log("Fehler beim auslesen des Datum-Feldes");                                          // CONSOLE LOG
      }
    })
  }

  /**
   * Unsubscribed alle Subscriptions
   */
  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  /**
   * Wird ausgeführt wenn sich die Datumseingabe ändert
   * Läd passend zum Datum die Inlandversanddaten, Monats- und Jahresstatistiken vom Server
   */
  refresh(){
    this.loadMonthData(this.selectedDate);
    this.loadYearAvgs();
    this.loadInnlandsversandData();
  }

  /**
   * Läd eine Liste von Innlandsversendungen für die Marktansicht vom Server und speichert sie in [inlandsversandDatenStahl] und [inlandsversandDatenEisen]
   */
  loadInnlandsversandData(): void {
    let subscription = this.esvService.getInnerShippingSteel().subscribe(response => {
      if (!response.success) return this.flashMessage.show(response.msg, { cssClass: 'alert-danger', timeout: 5000 });
      this.inlandsversandDatenStahl = response.data;
    })
    this.subscriptions.push(subscription);

    subscription = this.esvService.getInnerShippingIron().subscribe(response => {
      if (!response.success) return this.flashMessage.show(response.msg, { cssClass: 'alert-danger', timeout: 5000 });
      this.inlandsversandDatenEisen = response.data;
    })
    this.subscriptions.push(subscription);
  }

  /**
   * Läd eine Liste von Jahresdurschnittsstatistiken vom Server und speichert sie in [yearAvgList] 
   */
  loadYearAvgs(): void {
    const subscription = this.dataService.getYearAvgStats().subscribe( response => {
      if(!response.success) return this.flashMessage.show(response.msg, {cssClass: 'alert-danger', timeout: 5000})
      this.yearAvgList = response.data
    })
    this.subscriptions.push(subscription);
  }

  /**
   * Läd eine Liste von Monatstatistiken eines Jahres vom Server und speichert sie in [monthStatsList].
   * @param date Das Datum aus dessen Jahr die Liste geladen werden soll im Format JJJJ-MM-TT (Monat und Tag sind egal)
   */
  loadMonthData(date: string){
    this.selectedDate = date
    const subscription = this.dataService.getMonthStats(date).subscribe( data => {
      if(!data.success) return this.flashMessage.show(data.msg, {cssClass: 'alert-danger', timeout: 5000})
      this.monthStatsList = data.listOfRep
    })
    this.subscriptions.push(subscription);
  }
  
  /**
   * Wechselt zwischen den Einzelnen Ansichten für die Darstellung der Daten des Statistischen Bundesamtes
   * @param id ID des Tabs der anzuzeigen ist
   */
  changeView(id: string) {
    try {
      document.getElementById("fastRepMonth")!.className = "nav-link"
      document.getElementById("tab_fastRepMonth")!.className = "tab-pane fade"
      document.getElementById("fastRepYear")!.className = "nav-link"
      document.getElementById("tab_fastRepYear")!.className = "tab-pane fade"
      document.getElementById("import_steel")!.className = "nav-link"
      document.getElementById("tab_import_steel")!.className = "tab-pane fade"
      document.getElementById("import_iron")!.className = "nav-link"
      document.getElementById("tab_import_iron")!.className = "tab-pane fade"
      document.getElementById("market_steel")!.className = "nav-link"
      document.getElementById("tab_market_steel")!.className = "tab-pane fade"
      document.getElementById("market_iron")!.className = "nav-link"
      document.getElementById("tab_market_iron")!.className = "tab-pane fade"
      document.getElementById("import_iron_per_year")!.className = "nav-link"
      document.getElementById("tab_import_iron_per_year")!.className = "tab-pane fade"
      document.getElementById("import_steel_per_year")!.className = "nav-link"
      document.getElementById("tab_import_steel_per_year")!.className = "tab-pane fade"

      document.getElementById(id)!.className = "nav-link nav-link active"
      document.getElementById("tab_" + id)!.className = "tab-pane fade active show"
    } catch (error) {
      console.log("Tab-Element konnte nicht gefunden werden")
    }
  }

}
