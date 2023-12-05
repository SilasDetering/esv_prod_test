import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { HelperService } from 'src/client/app/services/helperServices/helper.service';
import { Subscription } from 'rxjs';
import { EsvDataService } from 'src/client/app/services/esvImportServices/esv-data.service';
import { countryImport } from 'src/client/app/models/importData.model';
import { FlashMessageService } from 'src/client/app/services/flashMessageServices/flash-message.service';

@Component({
  selector: 'app-esv-import-eisen',
  templateUrl: './esv-import-eisen.component.html',
  styleUrls: ['./esv-import-eisen.component.css']
})
export class EsvImportEisenComponent implements OnInit, OnChanges, OnDestroy {

  @Input() selectedDate: string = ""
  countryImports: Array<countryImport> = new Array

  private subscriptions: Subscription[] = [];

  constructor(private esvService: EsvDataService, private helper: HelperService, private flashMessage: FlashMessageService) { }

  ngOnInit(): void {
    this.loadCountryImports()
  }

  /**
   * Lädt die Daten für die Tabelle wenn sich das Datum ändert
   * @param changes  
   */
  ngOnChanges(changes: SimpleChanges): void {
    this.loadCountryImports()
  }


  /**
   * Unsubscribed alle Subscriptions
   */
  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  /**
   * Lädt die Daten für die Tabelle 
   */
  loadCountryImports(){
    const subscription = this.esvService.getImportsPerCountry(this.selectedDate).subscribe( data => {
      if(!data.success) return this.flashMessage.show(data.msg, {cssClass: 'alert-danger', timeout: 5000})
      this.countryImports = data.data.list
    })
    this.subscriptions.push(subscription);
  }

  /**
   * Wrapper Funktionen um den/das Monat/Jahr als String zu bekommen
   * @param date Datum als String
   */
  getWrittenMonth(date: string) {return this.helper.getMonthString(date)}
  getWrittenYear(date: string) {return this.helper.getYearString(date)}

  sumOfCountriesPerCategory(countryCategory: String, productName: String){
    let sum = 0
    
    this.countryImports.forEach(country => {
        if( (country.continent == countryCategory && !country.isEU && !country.isEFTA ) 
        || (country.continent == "Europa" && countryCategory == "EU" && country.isEU) 
        || (country.continent == "Europa" && countryCategory == "EFTA" && country.isEFTA) ){
          switch(productName){
            case "eisendraht_blank":{
              sum += country.eisendraht_blank
              break
            }
            case "eisendraht_verzinkt":{
              sum += country.eisendraht_verzinkt
              break
            }
            case "eisendraht_sonstiger":{
              sum += country.eisendraht_sonstiger
              break
            }
            case "eisendraht_kunststoffummantelt":{
              sum += country.eisendraht_kunststoffummantelt
              break
            }
          }
        }
    })

    return this.helper.round(sum)
  }

  sumOfAllCountries(productName: String){
    let sum = 0
    
    this.countryImports.forEach(country => {
      switch(productName){
        case "eisendraht_blank":{
          sum += country.eisendraht_blank
          break
        }
        case "eisendraht_verzinkt":{
          sum += country.eisendraht_verzinkt
          break
        }
        case "eisendraht_sonstiger":{
          sum += country.eisendraht_sonstiger
          break
        }
        case "eisendraht_kunststoffummantelt":{
          sum += country.eisendraht_kunststoffummantelt
          break
        }
      }
    })

    return this.helper.round(sum)
  }

  /**
   * Prüft ob ein Land einen Eintrag in der Tabelle hat
   * @param country Land
   * @returns true wenn der Eintrag nicht leer ist
   */
  entryIsNotEmpty(country: countryImport): Boolean{
    let sum = country.eisendraht_blank + country.eisendraht_verzinkt 
    + country.eisendraht_kunststoffummantelt + country.eisendraht_sonstiger
    return sum > 0;
  }

  // Funktion um die aktuelle Tabelle auszudrucken
  async print(): Promise<void> {
    const response = await fetch("https://bootswatch.com/5/flatly/bootstrap.min.css");
    const cssText = await response.text();
    const cssFile = require('./esv-import-eisen.component.css').toString();

    const printWindow = window.open('', '', 'height=800,width=1200');

    if (printWindow) {
      const tableToPrint = document.getElementById("printIronImportRep");

      if (tableToPrint) {
        const tableHTML = tableToPrint.outerHTML;

        printWindow.document.open();
        printWindow.document.write(`
          <html>
            <head>
            <style>
            ${cssText}
            ${cssFile}
            </style>
            </head>
            
            <body>
              ${tableHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      } else {
        printWindow.close();
      }
    } else {
      console.error('Failed to open print window.');
    }
  }
}

export interface countries {
  name: string
  blank: number
  verzinkt: number
  sonstige: number
  kunststoff: number
  eu: boolean
  efta: boolean
  continent: string
}