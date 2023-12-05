import { Injectable } from "@angular/core";
import { SummarizedIronReport, emptySummarizedIronReport, IronReport } from "../../models/report.model";
import { HelperService } from "./helper.service";


@Injectable({
  providedIn: 'root'
})
export class MtglDivergenzEisenService {

  constructor(private helper: HelperService) { }

  /**
   * Filtert zu einem übergebenenen Monat die passende Meldung und die Meldung des Vorjahres heraus und berechnet die Abweichung in Prozent
   * @param ironReports Liste von zusammengefassten Meldungen
   * @param selectedDate Datum des ausgewählten Monats "JJJJ-MM-TT"
   * @returns Monatsmeldung [0], Monatsmeldung des Vorjahres [1] und die Abweichung in Prozent [2]
   */
  calculateIronReportMonthSum(ironReports: SummarizedIronReport[], selectedDate: string): SummarizedIronReport[] {
    let newMonthSumReport: SummarizedIronReport[] = [];

    newMonthSumReport = this.getLastTwoReportsByMonth(ironReports, selectedDate);
    newMonthSumReport.push(this.calculateDivergenz(newMonthSumReport));
    return newMonthSumReport;
  }

  /**
   * Filtert zu einem übergebenenen Monat alle Meldungen vom 1. bis zum gewählten Monat und die Meldung des Vorjahres heraus und berechnet die Abweichung in Prozent
   * @param ironReports Liste von zusammengefassten Meldungen
   * @param selectedDate Datum des ausgewählten Monats "JJJJ-MM-TT"
   * @returns Aufsummierte Monatsmeldung des gewählten Monats [0] und des Vorjahres [1] und Abweichung in Prozent [3]
   */
  calculateIronReportYearSum(ironReports: SummarizedIronReport[], selectedDate: string): SummarizedIronReport[] {
    let newYearSumReport: SummarizedIronReport[] = [];

    newYearSumReport = this.sumReportsUntilSelectedDate(ironReports, selectedDate);
    newYearSumReport.push(this.calculateDivergenz(newYearSumReport));
    return newYearSumReport;
  }

  /**
   * Filtert zu einem übergebenenen Monat alle Meldungen aus demselben Quartal und dem Quartal des vorjahres heraus und gibt diese zurück
   * @param ironReports Liste von zusammengefassten Meldungen
   * @param selectedDate Datum des ausgewählten Monats "JJJJ-MM-TT"
   * @returns Quartalsmeldung des gewählten Monats [0] und des Vorjahres [1] + die Abweichung in Prozent[3]
   */
  calculateIronReportQuarterSum(ironReports: SummarizedIronReport[], selectedDate: string): SummarizedIronReport[] {
    let newQuarterSumReport: SummarizedIronReport[] = [];

    newQuarterSumReport = this.sumReportsForSelectedQuarter(ironReports, selectedDate);
    newQuarterSumReport.push(this.calculateDivergenz(newQuarterSumReport));

    return newQuarterSumReport;
  }

  /**
   * Sucht alle Meldungen aus einer Liste von Meldungen heraus, die im ausgewählten Monat und Jahr liegen und in dem Jahr davor.
   * @param reports Liste von Meldungen
   * @param date Monat nach dem gesucht wird "JJJJ-MM-TT"
   * @returns gefilterte Liste von Meldungen nach [date] aus den letzten zwei Jahren
   */
  getLastTwoReportsByMonth(reports: SummarizedIronReport[], date: string): SummarizedIronReport[] {
    const selectedReports: SummarizedIronReport[] = [];
    const selectedMonth = this.helper.getMonth(date);

    const selectedYear = new Date(date).getFullYear();

    for (let i = selectedYear - 1; i <= selectedYear; i++) {
      const year = i.toString();

      reports.forEach(report => {
        const reportYear = report.reportDate.substring(0, 4);

        if (parseInt(reportYear) === parseInt(year)) {
          const reportMonth = parseInt(report.reportDate.substring(5, 7));

          if (reportMonth === selectedMonth) {
            selectedReports.push(report);
          }
        }
      });
    }

    selectedReports.sort((a, b) => {
      const dateA = new Date(a.reportDate);
      const dateB = new Date(b.reportDate);
      return dateB.getTime() - dateA.getTime(); // Absteigende Sortierung nach Datum
    });

    return selectedReports;
  }

  /**
   * Berechnet aus den beiden letzten Meldungen die Abweichung in Prozent
   * @param newMonthSumReport Liste von SummarzedIronReports welche die letzten beiden Meldungen enthalten
   * @returns SummarizedIronReport mit den Abweichungen in Prozent
   */
  calculateDivergenz(newMonthSumReport: SummarizedIronReport[]): SummarizedIronReport {
    const divergenzReport = new emptySummarizedIronReport(newMonthSumReport[0]?.reportDate);

    const previousMonthSumReport = newMonthSumReport[1]; // Vorheriger Monat

    if (previousMonthSumReport) {
      const productKeys: (keyof SummarizedIronReport)[] = Object.keys(divergenzReport) as (keyof SummarizedIronReport)[];

      productKeys.forEach(key => {
        if (key !== 'reportDate') {
          const currentValue = Number(newMonthSumReport[0][key]);
          const previousValue = Number(previousMonthSumReport[key]);

          if (currentValue && previousValue) {
            let divergenz = 0;
            if (currentValue - previousValue === 0) { divergenz = 0; }
            else { divergenz = this.helper.round((currentValue - previousValue) / previousValue * 100); }
            divergenzReport[key] = divergenz;
          }
        }
      });
    }

    return divergenzReport;
  }

  /**
   * ermittelt die Summe aller Meldungen bis zum ausgewählten Datum
   * @param reports bereits zusammengefasste Meldungen
   * @param endDate ausgewähltes Datum
   * @returns eine Liste von zusammengefassten Meldungen aufsummiert bis zum ausgewählten Datum
   */
  sumReportsUntilSelectedDate(reports: SummarizedIronReport[], endDate: string): SummarizedIronReport[] {
    const selectedYear = new Date(endDate).getFullYear();
    const previousYear = selectedYear - 1;
    const selectedMonth = new Date(endDate).getMonth();
  
    const selectedYearReports: SummarizedIronReport[] = [];
    const previousYearReports: SummarizedIronReport[] = [];
  
    for (const report of reports) {
      const reportYear = new Date(report.reportDate).getFullYear();
      const reportMonth = new Date(report.reportDate).getMonth();
  
      if (reportYear === selectedYear && reportMonth <= selectedMonth) {
        selectedYearReports.push(report);
      } else if (reportYear === previousYear) {
        previousYearReports.push(report);
      }
    }
  
    const selectedYearSum = new emptySummarizedIronReport(endDate);

    selectedYearReports.forEach(report => {
      selectedYearSum.ed_blank_verkupfert_inland += report.ed_blank_verkupfert_inland;
      selectedYearSum.ed_geglueht_inland += report.ed_geglueht_inland;
      selectedYearSum.ed_verzinkt_inland += report.ed_verzinkt_inland;
      selectedYearSum.ed_verzinnt_inland += report.ed_verzinnt_inland;
      selectedYearSum.schraubendraht_inland += report.schraubendraht_inland;
      selectedYearSum.sonstige_inland += report.sonstige_inland;
      selectedYearSum.iron_inland_sum += report.iron_inland_sum;
      selectedYearSum.ed_blank_verkupfert_export += report.ed_blank_verkupfert_export;
      selectedYearSum.ed_geglueht_export += report.ed_geglueht_export;
      selectedYearSum.ed_verzinkt_export += report.ed_verzinkt_export;
      selectedYearSum.ed_verzinnt_export += report.ed_verzinnt_export;
      selectedYearSum.schraubendraht_export += report.schraubendraht_export;
      selectedYearSum.sonstige_export += report.sonstige_export;
      selectedYearSum.iron_export_sum += report.iron_export_sum;
      selectedYearSum.ed_blank_verkupfert_sum += report.ed_blank_verkupfert_sum;
      selectedYearSum.ed_geglueht_sum += report.ed_geglueht_sum;
      selectedYearSum.ed_verzinkt_sum += report.ed_verzinkt_sum;
      selectedYearSum.ed_verzinnt_sum += report.ed_verzinnt_sum;
      selectedYearSum.schraubendraht_sum += report.schraubendraht_sum;
      selectedYearSum.sonstige_sum += report.sonstige_sum;
      selectedYearSum.iron_sum += report.iron_sum;
    });
  
    const previousYearSum = new emptySummarizedIronReport(this.helper.getPreviousYearDate(endDate));      // TODO: DAS KANN NICHT STIMMEN

    previousYearReports.forEach(report => {
      previousYearSum.ed_blank_verkupfert_inland += report.ed_blank_verkupfert_inland;
      previousYearSum.ed_geglueht_inland += report.ed_geglueht_inland;
      previousYearSum.ed_verzinkt_inland += report.ed_verzinkt_inland;
      previousYearSum.ed_verzinnt_inland += report.ed_verzinnt_inland;
      previousYearSum.schraubendraht_inland += report.schraubendraht_inland;
      previousYearSum.sonstige_inland += report.sonstige_inland;
      previousYearSum.iron_inland_sum += report.iron_inland_sum;
      previousYearSum.ed_blank_verkupfert_export += report.ed_blank_verkupfert_export;
      previousYearSum.ed_geglueht_export += report.ed_geglueht_export;
      previousYearSum.ed_verzinkt_export += report.ed_verzinkt_export;
      previousYearSum.ed_verzinnt_export += report.ed_verzinnt_export;
      previousYearSum.schraubendraht_export += report.schraubendraht_export;
      previousYearSum.sonstige_export += report.sonstige_export;
      previousYearSum.iron_export_sum += report.iron_export_sum;
      previousYearSum.ed_blank_verkupfert_sum += report.ed_blank_verkupfert_sum;
      previousYearSum.ed_geglueht_sum += report.ed_geglueht_sum;
      previousYearSum.ed_verzinkt_sum += report.ed_verzinkt_sum;
      previousYearSum.ed_verzinnt_sum += report.ed_verzinnt_sum;
      previousYearSum.schraubendraht_sum += report.schraubendraht_sum;
      previousYearSum.sonstige_sum += report.sonstige_sum;
      previousYearSum.iron_sum += report.iron_sum;
    });

    const selectedReports = [selectedYearSum, previousYearSum];

    selectedReports.sort((a, b) => {
      const dateA = new Date(a.reportDate);
      const dateB = new Date(b.reportDate);
      return dateB.getTime() - dateA.getTime(); // Absteigende Sortierung nach Datum
    });
  
    return selectedReports;
  }

  /**
   * ermittelt die Summe aller Meldungen eines Quartals
   * @param reports bereits zusammengefasste Meldungen
   * @param date ausgewähltes Datum
   * @returns eine Liste von zusammengefassten Meldungen aufsummiert bis zum ausgewählten Datum
   */
  sumReportsForSelectedQuarter(reports: SummarizedIronReport[], date: string): SummarizedIronReport[] {
    const selectedYear = new Date(date).getFullYear();
    const previousYear = selectedYear - 1;
    const selectedQuarter = this.helper.getQuarter(date);
  
    const selectedQuarterReports: SummarizedIronReport[] = [];
    const previousQuaterReports: SummarizedIronReport[] = [];
  
    for (const report of reports) {
      const reportYear = new Date(report.reportDate).getFullYear();
      const reportQuarter = this.helper.getQuarter(report.reportDate);
  
      if (reportYear === selectedYear && reportQuarter === selectedQuarter) {
        selectedQuarterReports.push(report);
      } else if (reportYear === previousYear && reportQuarter === selectedQuarter) {
        previousQuaterReports.push(report);
      }
    }
  
    const selectedYearSum = new emptySummarizedIronReport(date);

    selectedQuarterReports.forEach(report => {
      selectedYearSum.ed_blank_verkupfert_inland += report.ed_blank_verkupfert_inland;
      selectedYearSum.ed_geglueht_inland += report.ed_geglueht_inland;
      selectedYearSum.ed_verzinkt_inland += report.ed_verzinkt_inland;
      selectedYearSum.ed_verzinnt_inland += report.ed_verzinnt_inland;
      selectedYearSum.schraubendraht_inland += report.schraubendraht_inland;
      selectedYearSum.sonstige_inland += report.sonstige_inland;
      selectedYearSum.iron_inland_sum += report.iron_inland_sum;
      selectedYearSum.ed_blank_verkupfert_export += report.ed_blank_verkupfert_export;
      selectedYearSum.ed_geglueht_export += report.ed_geglueht_export;
      selectedYearSum.ed_verzinkt_export += report.ed_verzinkt_export;
      selectedYearSum.ed_verzinnt_export += report.ed_verzinnt_export;
      selectedYearSum.schraubendraht_export += report.schraubendraht_export;
      selectedYearSum.sonstige_export += report.sonstige_export;
      selectedYearSum.iron_export_sum += report.iron_export_sum;
      selectedYearSum.ed_blank_verkupfert_sum += report.ed_blank_verkupfert_sum;
      selectedYearSum.ed_geglueht_sum += report.ed_geglueht_sum;
      selectedYearSum.ed_verzinkt_sum += report.ed_verzinkt_sum;
      selectedYearSum.ed_verzinnt_sum += report.ed_verzinnt_sum;
      selectedYearSum.schraubendraht_sum += report.schraubendraht_sum;
      selectedYearSum.sonstige_sum += report.sonstige_sum;
      selectedYearSum.iron_sum += report.iron_sum;
    });
  
    const previousYearSum = new emptySummarizedIronReport(this.helper.getPreviousYearDate(date));

    previousQuaterReports.forEach(report => {
      previousYearSum.ed_blank_verkupfert_inland += report.ed_blank_verkupfert_inland;
      previousYearSum.ed_geglueht_inland += report.ed_geglueht_inland;
      previousYearSum.ed_verzinkt_inland += report.ed_verzinkt_inland;
      previousYearSum.ed_verzinnt_inland += report.ed_verzinnt_inland;
      previousYearSum.schraubendraht_inland += report.schraubendraht_inland;
      previousYearSum.sonstige_inland += report.sonstige_inland;
      previousYearSum.iron_inland_sum += report.iron_inland_sum;
      previousYearSum.ed_blank_verkupfert_export += report.ed_blank_verkupfert_export;
      previousYearSum.ed_geglueht_export += report.ed_geglueht_export;
      previousYearSum.ed_verzinkt_export += report.ed_verzinkt_export;
      previousYearSum.ed_verzinnt_export += report.ed_verzinnt_export;
      previousYearSum.schraubendraht_export += report.schraubendraht_export;
      previousYearSum.sonstige_export += report.sonstige_export;
      previousYearSum.iron_export_sum += report.iron_export_sum;
      previousYearSum.ed_blank_verkupfert_sum += report.ed_blank_verkupfert_sum;
      previousYearSum.ed_geglueht_sum += report.ed_geglueht_sum;
      previousYearSum.ed_verzinkt_sum += report.ed_verzinkt_sum;
      previousYearSum.ed_verzinnt_sum += report.ed_verzinnt_sum;
      previousYearSum.schraubendraht_sum += report.schraubendraht_sum;
      previousYearSum.sonstige_sum += report.sonstige_sum;
      previousYearSum.iron_sum += report.iron_sum;
    });

    const selectedReports = [selectedYearSum, previousYearSum];

    selectedReports.sort((a, b) => {
      const dateA = new Date(a.reportDate);
      const dateB = new Date(b.reportDate);
      return dateB.getTime() - dateA.getTime(); // Absteigende Sortierung nach Datum
    });
  
    return selectedReports;
  }
  
  /**
   * Fasst die unterschiedlichen Eisen Produkte in zugehörige Kathegorien zusammen
   * @param data Eisen Meldung die Zusammengefasst werden soll
   * @returns Zusammengefasste Eisen Meldung
   */
  summarizeIronReport(data: IronReport[]): SummarizedIronReport[] {
    const summarizedReport: SummarizedIronReport[] = [];
  
    data.forEach(item => {
      const existingSummary = summarizedReport.find(summary => summary.reportDate === item.reportDate);
  
      if (existingSummary) {
        existingSummary.ed_blank_verkupfert_inland += item.ed_blank_verkupfert_inland;
        existingSummary.ed_geglueht_inland += item.ed_geglueht_inland;
        existingSummary.ed_verzinkt_inland += item.ed_verzinkt_bis_6_inland + item.ed_verzinkt_ueber_6_inland;
        existingSummary.ed_verzinnt_inland += item.ed_verzinnt_inland;
        existingSummary.schraubendraht_inland += item.schraubendraht_inland;
        existingSummary.sonstige_inland += item.blumendraht_inland + item.ed_kuststoffummantelt_inland
          + item.flachdraht_inland + item.kettendraht_inland
          + item.stangendraht_inland + item.npStahldraehte_inland;
        existingSummary.iron_inland_sum += item.ed_blank_verkupfert_inland + item.ed_geglueht_inland
          + item.ed_verzinkt_bis_6_inland + item.ed_verzinkt_ueber_6_inland
          + item.ed_verzinnt_inland + item.schraubendraht_inland
          + item.blumendraht_inland + item.ed_kuststoffummantelt_inland
          + item.flachdraht_inland + item.kettendraht_inland
          + item.stangendraht_inland + item.npStahldraehte_inland;
  
        existingSummary.ed_blank_verkupfert_export += item.ed_blank_verkupfert_export;
        existingSummary.ed_geglueht_export += item.ed_geglueht_export;
        existingSummary.ed_verzinkt_export += item.ed_verzinkt_bis_6_export + item.ed_verzinkt_ueber_6_export;
        existingSummary.ed_verzinnt_export += item.ed_verzinnt_export;
        existingSummary.schraubendraht_export += item.schraubendraht_export;
        existingSummary.sonstige_export += item.blumendraht_export + item.ed_kuststoffummantelt_export
          + item.flachdraht_export + item.kettendraht_export
          + item.stangendraht_export + item.npStahldraehte_export;
        existingSummary.iron_export_sum += item.ed_blank_verkupfert_export + item.ed_geglueht_export
          + item.ed_verzinkt_bis_6_export + item.ed_verzinkt_ueber_6_export
          + item.ed_verzinnt_export + item.schraubendraht_export
          + item.blumendraht_export + item.ed_kuststoffummantelt_export
          + item.flachdraht_export + item.kettendraht_export
          + item.stangendraht_export + item.npStahldraehte_export;
  
        existingSummary.ed_blank_verkupfert_sum = existingSummary.ed_blank_verkupfert_inland + existingSummary.ed_blank_verkupfert_export;
        existingSummary.ed_geglueht_sum = existingSummary.ed_geglueht_inland + existingSummary.ed_geglueht_export;
        existingSummary.ed_verzinkt_sum = existingSummary.ed_verzinkt_inland + existingSummary.ed_verzinkt_export;
        existingSummary.ed_verzinnt_sum = existingSummary.ed_verzinnt_inland + existingSummary.ed_verzinnt_export;
        existingSummary.schraubendraht_sum = existingSummary.schraubendraht_inland + existingSummary.schraubendraht_export;
        existingSummary.sonstige_sum = existingSummary.sonstige_inland + existingSummary.sonstige_export;
        existingSummary.iron_sum = existingSummary.iron_inland_sum + existingSummary.iron_export_sum;
      } else {
        const newSummary: SummarizedIronReport = {
          reportDate: item.reportDate,
          ed_blank_verkupfert_inland: item.ed_blank_verkupfert_inland,
          ed_geglueht_inland: item.ed_geglueht_inland,
          ed_verzinkt_inland: item.ed_verzinkt_bis_6_inland + item.ed_verzinkt_ueber_6_inland,
          ed_verzinnt_inland: item.ed_verzinnt_inland,
          schraubendraht_inland: item.schraubendraht_inland,
          sonstige_inland: item.blumendraht_inland + item.ed_kuststoffummantelt_inland
            + item.flachdraht_inland + item.kettendraht_inland
            + item.stangendraht_inland + item.npStahldraehte_inland,
          iron_inland_sum: item.ed_blank_verkupfert_inland + item.ed_geglueht_inland
            + item.ed_verzinkt_bis_6_inland + item.ed_verzinkt_ueber_6_inland
            + item.ed_verzinnt_inland + item.schraubendraht_inland
            + item.blumendraht_inland + item.ed_kuststoffummantelt_inland
            + item.flachdraht_inland + item.kettendraht_inland
            + item.stangendraht_inland + item.npStahldraehte_inland,
  
          ed_blank_verkupfert_export: item.ed_blank_verkupfert_export,
          ed_geglueht_export: item.ed_geglueht_export,
          ed_verzinkt_export: item.ed_verzinkt_bis_6_export + item.ed_verzinkt_ueber_6_export,
          ed_verzinnt_export: item.ed_verzinnt_export,
          schraubendraht_export: item.schraubendraht_export,
          sonstige_export: item.blumendraht_export + item.ed_kuststoffummantelt_export
            + item.flachdraht_export + item.kettendraht_export
            + item.stangendraht_export + item.npStahldraehte_export,
          iron_export_sum: item.ed_blank_verkupfert_export + item.ed_geglueht_export
            + item.ed_verzinkt_bis_6_export + item.ed_verzinkt_ueber_6_export
            + item.ed_verzinnt_export + item.schraubendraht_export
            + item.blumendraht_export + item.ed_kuststoffummantelt_export
            + item.flachdraht_export + item.kettendraht_export
            + item.stangendraht_export + item.npStahldraehte_export,
  
          ed_blank_verkupfert_sum: item.ed_blank_verkupfert_inland + item.ed_blank_verkupfert_export,
          ed_geglueht_sum: item.ed_geglueht_inland + item.ed_geglueht_export,
          ed_verzinkt_sum: item.ed_verzinkt_bis_6_inland + item.ed_verzinkt_ueber_6_inland
            + item.ed_verzinkt_bis_6_export + item.ed_verzinkt_ueber_6_export,
          ed_verzinnt_sum: item.ed_verzinnt_inland + item.ed_verzinnt_export,
          schraubendraht_sum: item.schraubendraht_inland + item.schraubendraht_export,
          sonstige_sum: item.blumendraht_inland + item.ed_kuststoffummantelt_inland
            + item.flachdraht_inland + item.kettendraht_inland
            + item.stangendraht_inland + item.npStahldraehte_inland
            + item.blumendraht_export + item.ed_kuststoffummantelt_export
            + item.flachdraht_export + item.kettendraht_export
            + item.stangendraht_export + item.npStahldraehte_export,
          iron_sum: item.ed_blank_verkupfert_inland + item.ed_geglueht_inland
            + item.ed_verzinkt_bis_6_inland + item.ed_verzinkt_ueber_6_inland
            + item.ed_verzinnt_inland + item.schraubendraht_inland
            + item.blumendraht_inland + item.ed_kuststoffummantelt_inland
            + item.flachdraht_inland + item.kettendraht_inland
            + item.stangendraht_inland + item.npStahldraehte_inland
            + item.ed_blank_verkupfert_export + item.ed_geglueht_export
            + item.ed_verzinkt_bis_6_export + item.ed_verzinkt_ueber_6_export
            + item.ed_verzinnt_export + item.schraubendraht_export
            + item.blumendraht_export + item.ed_kuststoffummantelt_export
            + item.flachdraht_export + item.kettendraht_export
            + item.stangendraht_export + item.npStahldraehte_export,
        };
  
        summarizedReport.push(newSummary);
      }
    });
  
    return summarizedReport;
  }
  

}
