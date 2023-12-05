import { Injectable } from '@angular/core';
import { HelperService } from '../helperServices/helper.service';

@Injectable({
  providedIn: 'root'
})
export class MarketService {

  constructor(private helper: HelperService) { }

  firstQuarter: Array<string> = ["Januar", "Februar", "März"];
  secondQuarter: Array<string> = ["April", "Mai", "Juni"];
  thirdQuarter: Array<string> = ["Juli", "August", "September"];
  fourthQuarter: Array<string> = ["Oktober", "November", "Dezember"];

  /**
   * Berechnet die Summer der Quartale und Halbjahre aus den übergebenen Markt-Daten
   * @param marketData Map aus Monaten (string) und Daten (number) Bspw: "Januar" -> 1234
   * @returns Map mit einträgen für die Quartale und Halbjahre. Bspw: "1. Quartal" -> 1234 oder "1. Halbjahr" -> 1234
   */
  calculateQuarterlyAndHalfYearSums(marketData: Map<string, number>): Map<string, number> {
    // Initialisierung der Summen
    let firstQuarter_sum = 0;
    let secondQuarter_sum = 0;
    let thirdQuarter_sum = 0;
    let fourthQuarter_sum = 0;
    let firstHalfYear_sum = 0;
    let secondHalfYear_sum = 0;

    for (let key of marketData.keys()) {
        if (this.firstQuarter.includes(key)) {
            firstQuarter_sum += marketData.get(key)!;
            firstHalfYear_sum += marketData.get(key)!;
        } else if (this.secondQuarter.includes(key)) {
            secondQuarter_sum += marketData.get(key)!;
            firstHalfYear_sum += marketData.get(key)!;
        } else if (this.thirdQuarter.includes(key)) {
            thirdQuarter_sum += marketData.get(key)!;
            secondHalfYear_sum += marketData.get(key)!;
        } else if (this.fourthQuarter.includes(key)) {
            fourthQuarter_sum += marketData.get(key)!;
            secondHalfYear_sum += marketData.get(key)!;
        }
    }

    // Erstellen und Rückgabe der neuen Map mit den berechneten Werten
    const calculatedMap = new Map<string, number>();
    calculatedMap.set("1. Quartal", this.helper.round(firstQuarter_sum));
    calculatedMap.set("2. Quartal", this.helper.round(secondQuarter_sum));
    calculatedMap.set("3. Quartal", this.helper.round(thirdQuarter_sum));
    calculatedMap.set("4. Quartal", this.helper.round(fourthQuarter_sum));
    calculatedMap.set("1. Halbjahr", this.helper.round(firstHalfYear_sum));
    calculatedMap.set("2. Halbjahr", this.helper.round(secondHalfYear_sum));

    return calculatedMap;
  }

  /**
   * Merged zwei Maps und gibt die neue Map zurück
   * @param map1 Map<string, Number>
   * @param map2 Map<string, Number>
   * @returns Zusammengefügte map1 und map2 als Map<string, Number>
   */
  mergeMaps<String, Number>(map1: Map<string, number>, map2: Map<string, number>): Map<string, number> {
    map2.forEach((value, key) => {
        map1.set(key, value);
    });
    return map1;
  }
}
