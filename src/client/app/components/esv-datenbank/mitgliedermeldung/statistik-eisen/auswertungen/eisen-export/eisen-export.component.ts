import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-eisen-export',
  templateUrl: './eisen-export.component.html',
  styleUrls: ['./eisen-export.component.css']
})
export class EisenExportComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * Wechselt zwischen den Einzelnen Ansichten für die Darstellung der Daten der Länder
   * @param id ID des Tabs der anzuzeigen ist
   */
  changeView(id: string) {
    try {
      document.getElementById("month")!.className = "nav-link"
      document.getElementById("tab_month")!.className = "tab-pane fade"
      document.getElementById("quartal")!.className = "nav-link"
      document.getElementById("tab_quartal")!.className = "tab-pane fade"
      document.getElementById("total")!.className = "nav-link"
      document.getElementById("tab_total")!.className = "tab-pane fade"

      document.getElementById(id)!.className = "nav-link nav-link active"
      document.getElementById("tab_" + id)!.className = "tab-pane fade active show"
    } catch (error) {
      console.log("Tab-Element konnte nicht gefunden werden")
    }
  }

}
