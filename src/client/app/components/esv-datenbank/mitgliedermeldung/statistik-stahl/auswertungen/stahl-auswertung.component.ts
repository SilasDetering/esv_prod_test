import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-stahl-auswertung',
  templateUrl: './stahl-auswertung.component.html',
  styleUrls: ['./stahl-auswertung.component.css']
})
export class StahlAuswertungComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  
  /**
   * Wechselt zwischen den Einzelnen Ansichten für die Darstellung der Daten des Statistischen Bundesamtes
   * @param id ID des Tabs der anzuzeigen ist
   */
  changeView(id: string) {
    try {
      document.getElementById("pivot")!.className = "nav-link"
      document.getElementById("tab_pivot")!.className = "tab-pane fade"
      document.getElementById("export")!.className = "nav-link"
      document.getElementById("tab_export")!.className = "tab-pane fade"
      document.getElementById("divergence")!.className = "nav-link"
      document.getElementById("tab_divergence")!.className = "tab-pane fade"

      document.getElementById(id)!.className = "nav-link nav-link active"
      document.getElementById("tab_" + id)!.className = "tab-pane fade active show"
    } catch (error) {
      console.log("Tab-Element konnte nicht gefunden werden")
    }
  }
}