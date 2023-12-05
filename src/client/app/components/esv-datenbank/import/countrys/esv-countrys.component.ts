import { Component, OnDestroy, OnInit } from '@angular/core';
import {Location} from '@angular/common';
import { Subscription } from 'rxjs';
import { Country } from 'src/client/app/models/country.model';
import { EsvCountryService } from 'src/client/app/services/esvImportServices/esvCountry.service';
import { EsvDataService } from 'src/client/app/services/esvImportServices/esv-data.service';
import { FlashMessageService } from 'src/client/app/services/flashMessageServices/flash-message.service';

@Component({
  selector: 'app-esv-countrys',
  templateUrl: './esv-countrys.component.html',
  styleUrls: ['./esv-countrys.component.css']
})
export class EsvCountrysComponent implements OnInit, OnDestroy {

  constructor(private esvCountryService: EsvCountryService, private flashMessage: FlashMessageService, private dataService: EsvDataService, private location: Location) { }

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.loadCountryList("all");
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  // Liste zum anzeigen
  listOfCountries: any;

  // Add Country Variablen
  newCountry_ID: String = "";
  newCountry_Name: String = "";
  newCountry_Continent: String = "";
  newCountry_isEU: boolean = false;
  newCountry_isEFTA: boolean = false;

  // Zu löschendes Land
  countryToDelete: Country = {
    "name": "(Fehler)",
    "continent": "(Fehler)",
    "countryID": "0",
    "isEFTA": false,
    "isEU": false,
  };

  onSelectCountry(){
    var select_countries = (document.getElementById('continent-select') as HTMLSelectElement).value;
    this.loadCountryList(select_countries);
  }
  
  backClick() {
    this.location.back();
  }

  // Läd eine Liste aller Länder der Applikation für die Verwaltung
  loadCountryList(filter: string){
    const subscription = this.esvCountryService.getListOfCountries(filter).subscribe(data => {
      if(data.success){
        this.listOfCountries = data.countryList;
      }else{
        this.flashMessage.show(data.msg, {cssClass: 'alert-danger', timeout: 5000});
      }
    });
    this.subscriptions.push(subscription);
  }

  // Fügt ein neues Land in die Liste der Länder ein
  onAddCountrySubmit(){
    const newCountry: Country = {
      countryID: this.newCountry_ID,
      name: this.newCountry_Name,
      continent: this.newCountry_Continent,
      isEU: this.newCountry_isEU,
      isEFTA: this.newCountry_isEFTA
    }

    if( !this.validateNewCountryData(newCountry) ){
      this.flashMessage.show("Ungültige Eingabe", {cssClass: 'alert-danger', timeout: 5000});
      return;
    }

    const subscription = this.esvCountryService.addCountry(newCountry).subscribe( (data) => {
      if(data.success){
        window.location.reload();
        this.dataService.refreshMonthStats();
        this.flashMessage.show('Benutzer wurde erfolgreich registriert', {cssClass: 'alert-success', timeout:3000});
      }else{
        this.flashMessage.show(data.msg, {cssClass: 'alert-danger', timeout:3000});
      }
    });

    this.subscriptions.push(subscription);
  }

  validateNewCountryData(data: Country): boolean {
    if (data.countryID == "" || data.name == "") {
      return false;
    } else if (data.isEU && data.isEFTA) {
      return false;
    } else if (!(data.continent == "Europa" || data.continent == "Afrika" || data.continent == "Asien" || data.continent == "Antarktis" 
      || data.continent == "Nordamerika" || data.continent == "Ozeanien" || data.continent == "Südamerika")) {
      return false;
    } else if ( (data.isEU || data.isEFTA) && !(data.continent=="Europa") ){
      return false;
    }
    return true;
  }

  secondConfirm(country: Country){
    this.countryToDelete = country;
    document.getElementById("secondConfirm")!.style.display = "inline";
  }
  aboardConfirm(){
    this.countryToDelete = {
      "name": "(Fehler)",
      "continent": "(Fehler)",
      "countryID": "0",
      "isEFTA": false,
      "isEU": false,
    };
    document.getElementById("secondConfirm")!.style.display = "none";
  }

  deleteCountry(country: Country){
    const subscription = this.esvCountryService.deleteCountry(country).subscribe((data)=>{
      if(data.success){
        this.dataService.refreshMonthStats()
        window.location.reload();
        this.flashMessage.show('Das Land '+ country.name +' wurde entfernt', {cssClass: 'alert-success', timeout:3000});
      }else{
        this.flashMessage.show(data.msg, {cssClass: 'alert-danger', timeout:3000});
      }
    });
    this.subscriptions.push(subscription);
  }
}