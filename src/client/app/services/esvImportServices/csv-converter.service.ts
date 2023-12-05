/**
 * Service für die übersetzung und verarbeitung der CSV Datei in JSON-Format.
*/

import { Injectable, OnDestroy } from '@angular/core';
import * as Papa from 'papaparse';
import { Subscription } from 'rxjs';
import { EsvImport } from '../../models/importData.model';
import { EsvDataService } from './esv-data.service';
import { FlashMessageService } from '../flashMessageServices/flash-message.service';

@Injectable({
  providedIn: 'root'
})
export class CsvConverterService implements OnDestroy {

  private subscriptions: Subscription[] = [];

  constructor(private esvDataService: EsvDataService, private flashMessage: FlashMessageService) { }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  // Liste an Produkt IDs wonach die gewünschten Produkte herausgefiltert werden sollen
  productIDs = ["WA72171010", "WA72171039", "WA72172010", "WA72172030", "WA72173041", "WA72173049",
    "WA72179020", "WA72171050", "WA72172050", "WA72179050", "WA72171090", "WA72172090", "WA72173090",
    "WA72179090"
  ];

  /**
   * Wandelt eine CSV Datei in eine gewünschte Strucktur um und sendet diese an den Server.
   * 1. CSV zu JSON umwandeln "readCSV()"
   * 2. Gewünschte Zeilen herausfiltern "filterData()"
   * 3. Datensatz neu struckturieren, damit dieser besser speicher/lesbar ist "transformData()"
   * 4. Bestimmte Produkte anhand der Klassifizierung zusammenfügen "mergeData()"
   * 5. Das übergebene Datum als Report Datum und das aktuelle Datum als insertDate hinzufügen und den Tag des reportDate auf den ersten Tag des Monats normieren "addDate()"
   * 6. An den server senden
  */
  handleCSVData(csvData: any, importDate: string) {
    this.readCSV(csvData, (results) => {
      var jsonData = this.filterData(results.data as any[]);
      jsonData = this.transformData(jsonData);
      jsonData = this.mergeData(jsonData);
      jsonData = this.addDate(jsonData, importDate)
      this.sendData(jsonData);
    });
  }

  // 1. Wandelt eine CSV Datei in ein JSON Objekt um und tauscht leere Dateneinträge mit 0.
  readCSV(file: File, callback: (results: any) => void) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transform: (value: string) => {
        value = value == "-" ? "0" : value;
        return value;
      },
      complete: callback
    });
  }

  // 2. Filtert die gewünschten Daten anhand der Einheit (Gewicht) und der ProduktID heraus. Leere Zeilen (data = 0) werden entfernt
  filterData(jsonData: any[]) {
    return jsonData.filter(data => data['__parsed_extra']
      && data['__parsed_extra'].includes("Einfuhr: Gewicht")
      && this.productIDs.some(id => data['__parsed_extra'].includes(id))
      && !(data["__parsed_extra"][data["__parsed_extra"].length - 1] == 0)
    );
  }

  // 3. Ordnet die Daten nach dem JSON-Schema "esvImport"
  transformData(data: any[]): any[] {
    return data.map((item) => {
      return {
        originID: item["__parsed_extra"][0],
        originName: item["__parsed_extra"][1],
        productID: item["__parsed_extra"][2],
        productName: item["__parsed_extra"][3],
        data: parseFloat(item["__parsed_extra"][item["__parsed_extra"].length - 1].replace(",", "."))
      };
    });
  }

  // 4. Fasst die Daten nach den Kategorien Blank, Verzinkt und Sontiges zusammen je nach Eisen/Staal Art um den Datensatz zu vereinfachen
  mergeData(data: EsvImport[]) {
    data = this.translateProductID(data);
    return this.combineData(data);
  }

  /**
   * 5. Fügt das Import Datum an den Datensatz an, damit dieser einem Datum zugeortnet werden kann. 
   * Das Datum wir auf den 1. Tag des Monats normiert, damit dieses besser verglichen werden kann.
   * Zusätzlich wird das aktuelle Datum als Insert Datum hinzugefügt.
   */ 
  addDate(data: EsvImport[], importDate: string): EsvImport[] {
    const [jahr, monat, tag] = importDate.split('-'); 
    importDate = `${jahr}-${monat}-01`;

    return data.map(item => {
      return {
        ...item,
        importDate,
        insertDate: new Date().toISOString()
      };
    });
  }

  // 6. Sendet die übergebenen Daten an den Server um diese in der Datenbank zu speichern
  sendData(data: EsvImport[]) {
    const subscription = this.esvDataService.sendImportData(data).subscribe((data) => {
      if (!data.success) {
        this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 5000 })
      }else{
        window.location.reload();
      }
    });
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  /* 
    Fasst Daten in der selben Produktkathegorie zusammen.
    
    Die Funktion erstellt ein neus Array mit den Daten und einem key aus import Land und Produkt ID.
    Danach prüft sie ob ein Objekt mit dem selben Key schon vorhanden ist. Ist das der Fall werden beide Objekte zusammen addiert.
    Falls nicht wird das Objekt in das neue Array hinzugefügt. Am Ende werden alle Werte im neuen Array als esvImport Objekt zurückgegeben
  */
  private combineData(dataSet: EsvImport[]): EsvImport[] {
    const groupedData: { [key: string]: EsvImport } = {};

    dataSet.forEach((item) => {
      const key = `${item.originID}-${item.productID}`;
      if (groupedData[key]) {
        groupedData[key].data = groupedData[key].data + item.data;
      } else {
        groupedData[key] = { ...item };
      }
    });
    return Object.values(groupedData);
  }

  // Übersetzt die ProduktIDs in zusammengehörige Kategorien, damit die Daten später zusammengefasst werden können
  private translateProductID(dataSet: EsvImport[]): EsvImport[] {
    for (var item of dataSet) {
      switch (item.productID) {
        case "WA72171010":
        case "WA72171039": {
          item.productID = "WA72171010, WA72171039";
          item.productName = "Eisendraht, blank"
          break;
        }
        case "WA72172010":
        case "WA72172030": {
          item.productID = "WA72172010, WA72172030";
          item.productName = "Eisendraht, verzinkt"
          break;
        }
        case "WA72173041":
        case "WA72173049": {
          item.productID = "WA72173041, WA72173049";
          item.productName = "Eisendraht, sontiger"
          break;
        }
        case "WA72179020": {
          item.productID = "WA72179020";
          item.productName = "Eisendraht, kunststoffummantelt";
          break;
        }
        case "WA72171050": {
          item.productName = "Stahldraht, weniger als 0,6% C, blank";
          break;
        }
        case "WA72172050": {
          item.productName = "Stahldraht, weniger als 0,6% C, verzinkt";
          break;
        }
        case "WA72179050": {
          item.productID = "WA72179050";
          item.productName = "Stahldraht, weniger als 0,6% C, sonstiger";
          break;
        }
        case "WA72171090": {
          item.productName = "Stahldraht, 0,6% C und mehr, blank";
          break;
        }
        case "WA72172090": {
          item.productName = "Stahldraht, 0,6% C und mehr, verzinkt";
          break;
        }
        case "WA72173090":
        case "WA72179090": {
          item.productID = "WA72173090, WA72179090";
          item.productName = "Stahldraht, 0,6% C und mehr, sonstiger";
          break;
        }
        default: {
          throw new Error("Filter Fehler bei esvService/csv-converter:translateProductID");
        }
      }
    }
    return dataSet;
  }
}