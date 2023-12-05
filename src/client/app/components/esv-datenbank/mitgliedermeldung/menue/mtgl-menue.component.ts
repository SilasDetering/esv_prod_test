import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-mtgl-menue',
  templateUrl: './mtgl-menue.component.html',
  styleUrls: ['./mtgl-menue.component.css']
})
export class MtglMenueComponent implements OnInit {

  private defaultStatType = 'eisen'; // Standardwert für die Ansicht

  constructor(private route: ActivatedRoute, private titleService: Title) {
    this.titleService.setTitle('ESV - Mitglieder Statistik');
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const statType = params.get('statType') || this.defaultStatType;
      
      if(statType == 'stahl') this.changeView("menueSteel")
      else this.changeView("menueIron")
    });
  }

  /**
   * Wechselt zwischen den Einzelnen Ansichten für die Darstellung der Daten des Statistischen Bundesamtes
   * @param id ID des Tabs der anzuzeigen ist
   */
  changeView(id: string) {
    try {
      document.getElementById("menueIron")!.className = "nav-link"
      document.getElementById("tab_menueIron")!.className = "tab-pane fade"
      document.getElementById("menueSteel")!.className = "nav-link"
      document.getElementById("tab_menueSteel")!.className = "tab-pane fade"

      document.getElementById(id)!.className = "nav-link nav-link active"
      document.getElementById("tab_" + id)!.className = "tab-pane fade active show"
    } catch (error) {
      console.log("Tab-Element konnte nicht gefunden werden")
    }
  }

}
