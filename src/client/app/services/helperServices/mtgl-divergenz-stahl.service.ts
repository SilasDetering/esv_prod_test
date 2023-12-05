import { Injectable } from '@angular/core';
import { SummarizedSteelReport, emptySummarizedSteelReport, SteelReport } from '../../models/report.model';
import { HelperService } from './helper.service';

@Injectable({
  providedIn: 'root'
})
export class MtglDivergenzStahlService {

  constructor(private helper: HelperService) { }

  /**
   * Filtert zu einem übergebenenen Monat die passende Meldung und die Meldung des Vorjahres heraus und berechnet die Abweichung in Prozent
   * @param SteelReports Liste von zusammengefassten Meldungen
   * @param selectedDate Datum des ausgewählten Monats "JJJJ-MM-TT"
   * @returns Monatsmeldung [0], Monatsmeldung des Vorjahres [1] und die Abweichung in Prozent [2]
   */
  calculateSteelReportMonthSum(SteelReports: SummarizedSteelReport[], selectedDate: string): SummarizedSteelReport[] {
    let newMonthSumReport: SummarizedSteelReport[] = [];

    newMonthSumReport = this.getLastTwoReportsByMonth(SteelReports, selectedDate);
    newMonthSumReport.push(this.calculateDivergenz(newMonthSumReport));
    return newMonthSumReport;
  }

  /**
   * Filtert zu einem übergebenenen Monat alle Meldungen vom 1. bis zum gewählten Monat und die Meldung des Vorjahres heraus und berechnet die Abweichung in Prozent
   * @param SteelReports Liste von zusammengefassten Meldungen
   * @param selectedDate Datum des ausgewählten Monats "JJJJ-MM-TT"
   * @returns Aufsummierte Monatsmeldung des gewählten Monats [0] und des Vorjahres [1] und Abweichung in Prozent [3]
   */
  calculateSteelReportYearSum(SteelReports: SummarizedSteelReport[], selectedDate: string): SummarizedSteelReport[] {
    let newYearSumReport: SummarizedSteelReport[] = [];

    newYearSumReport = this.sumReportsUntilSelectedDate(SteelReports, selectedDate);
    newYearSumReport.push(this.calculateDivergenz(newYearSumReport));
    return newYearSumReport;
  }

  /**
   * Filtert zu einem übergebenenen Monat alle Meldungen aus demselben Quartal und dem Quartal des vorjahres heraus und gibt diese zurück
   * @param SteelReports Liste von zusammengefassten Meldungen
   * @param selectedDate Datum des ausgewählten Monats "JJJJ-MM-TT"
   * @returns Quartalsmeldung des gewählten Monats [0] und des Vorjahres [1] + die Abweichung in Prozent[3]
   */
  calculateSteelReportQuarterSum(SteelReports: SummarizedSteelReport[], selectedDate: string): SummarizedSteelReport[] {
    let newQuarterSumReport: SummarizedSteelReport[] = [];

    newQuarterSumReport = this.sumReportsForSelectedQuarter(SteelReports, selectedDate);
    newQuarterSumReport.push(this.calculateDivergenz(newQuarterSumReport));

    return newQuarterSumReport;
  }

  /**
   * Sucht alle Meldungen aus einer Liste von Meldungen heraus, die im ausgewählten Monat und Jahr liegen und in dem Jahr davor.
   * @param reports Liste von Meldungen
   * @param date Monat nach dem gesucht wird "JJJJ-MM-TT"
   * @returns gefilterte Liste von Meldungen nach [date] aus den letzten zwei Jahren
   */
  getLastTwoReportsByMonth(reports: SummarizedSteelReport[], date: string): SummarizedSteelReport[] {
    const selectedReports: SummarizedSteelReport[] = [];
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
   * @param newMonthSumReport Liste von SummarzedSteelReports welche die letzten beiden Meldungen enthalten
   * @returns SummarizedSteelReport mit den Abweichungen in Prozent
   */
  calculateDivergenz(newMonthSumReport: SummarizedSteelReport[]): SummarizedSteelReport {
    const divergenzReport = new emptySummarizedSteelReport(newMonthSumReport[0]?.reportDate);

    const previousMonthSumReport = newMonthSumReport[1]; // Vorheriger Monat

    if (previousMonthSumReport) {
      const productKeys: (keyof SummarizedSteelReport)[] = Object.keys(divergenzReport) as (keyof SummarizedSteelReport)[];

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
  sumReportsUntilSelectedDate(reports: SummarizedSteelReport[], endDate: string): SummarizedSteelReport[] {
    const selectedYear = new Date(endDate).getFullYear();
    const previousYear = selectedYear - 1;
    const selectedMonth = new Date(endDate).getMonth();

    const selectedYearReports: SummarizedSteelReport[] = [];
    const previousYearReports: SummarizedSteelReport[] = [];

    for (const report of reports) {
      const reportYear = new Date(report.reportDate).getFullYear();
      const reportMonth = new Date(report.reportDate).getMonth();

      if (reportYear === selectedYear && reportMonth <= selectedMonth) {
        selectedYearReports.push(report);
      } else if (reportYear === previousYear) {
        previousYearReports.push(report);
      }
    }

    const selectedYearSum = new emptySummarizedSteelReport(endDate);

    selectedYearReports.forEach(report => {
      selectedYearSum.seildraht_inland += report.seildraht_inland;
      selectedYearSum.federdraht_inland += report.federdraht_inland;
      selectedYearSum.draehte_sonstige_inland += report.draehte_sonstige_inland;
      selectedYearSum.steel_inland_sum += report.steel_inland_sum;

      selectedYearSum.seildraht_export += report.seildraht_export;
      selectedYearSum.federdraht_export += report.federdraht_export;
      selectedYearSum.draehte_sonstige_export += report.draehte_sonstige_export;
      selectedYearSum.steel_export_sum += report.steel_export_sum;

      selectedYearSum.seildraht_sum += report.seildraht_sum;
      selectedYearSum.federdraht_sum += report.federdraht_sum;
      selectedYearSum.draehte_sonstige_sum += report.draehte_sonstige_sum;
      selectedYearSum.steel_sum += report.steel_sum;
    });

    const previousYearSum = new emptySummarizedSteelReport(this.helper.getPreviousYearDate(endDate));      // TODO: DAS KANN NICHT STIMMEN

    previousYearReports.forEach(report => {
      previousYearSum.seildraht_inland += report.seildraht_inland;
      previousYearSum.federdraht_inland += report.federdraht_inland;
      previousYearSum.draehte_sonstige_inland += report.draehte_sonstige_inland;
      previousYearSum.steel_inland_sum += report.steel_inland_sum;

      previousYearSum.seildraht_export += report.seildraht_export;
      previousYearSum.federdraht_export += report.federdraht_export;
      previousYearSum.draehte_sonstige_export += report.draehte_sonstige_export;
      previousYearSum.steel_export_sum += report.steel_export_sum;

      previousYearSum.seildraht_sum += report.seildraht_sum;
      previousYearSum.federdraht_sum += report.federdraht_sum;
      previousYearSum.draehte_sonstige_sum += report.draehte_sonstige_sum;
      previousYearSum.steel_sum += report.steel_sum;
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
  sumReportsForSelectedQuarter(reports: SummarizedSteelReport[], date: string): SummarizedSteelReport[] {
    const selectedYear = new Date(date).getFullYear();
    const previousYear = selectedYear - 1;
    const selectedQuarter = this.helper.getQuarter(date);

    const selectedQuarterReports: SummarizedSteelReport[] = [];
    const previousQuaterReports: SummarizedSteelReport[] = [];

    for (const report of reports) {
      const reportYear = new Date(report.reportDate).getFullYear();
      const reportQuarter = this.helper.getQuarter(report.reportDate);

      if (reportYear === selectedYear && reportQuarter === selectedQuarter) {
        selectedQuarterReports.push(report);
      } else if (reportYear === previousYear && reportQuarter === selectedQuarter) {
        previousQuaterReports.push(report);
      }
    }

    const selectedYearSum = new emptySummarizedSteelReport(date);

    selectedQuarterReports.forEach(report => {
      selectedYearSum.seildraht_inland += report.seildraht_inland;
      selectedYearSum.federdraht_inland += report.federdraht_inland;
      selectedYearSum.draehte_sonstige_inland += report.draehte_sonstige_inland;
      selectedYearSum.steel_inland_sum += report.steel_inland_sum;

      selectedYearSum.seildraht_export += report.seildraht_export;
      selectedYearSum.federdraht_export += report.federdraht_export;
      selectedYearSum.draehte_sonstige_export += report.draehte_sonstige_export;
      selectedYearSum.steel_export_sum += report.steel_export_sum;

      selectedYearSum.seildraht_sum += report.seildraht_sum;
      selectedYearSum.federdraht_sum += report.federdraht_sum;
      selectedYearSum.draehte_sonstige_sum += report.draehte_sonstige_sum;
      selectedYearSum.steel_sum += report.steel_sum;
    });

    const previousYearSum = new emptySummarizedSteelReport(this.helper.getPreviousYearDate(date));

    previousQuaterReports.forEach(report => {
      previousYearSum.seildraht_inland += report.seildraht_inland;
      previousYearSum.federdraht_inland += report.federdraht_inland;
      previousYearSum.draehte_sonstige_inland += report.draehte_sonstige_inland;
      previousYearSum.steel_inland_sum += report.steel_inland_sum;

      previousYearSum.seildraht_export += report.seildraht_export;
      previousYearSum.federdraht_export += report.federdraht_export;
      previousYearSum.draehte_sonstige_export += report.draehte_sonstige_export;
      previousYearSum.steel_export_sum += report.steel_export_sum;

      previousYearSum.seildraht_sum += report.seildraht_sum;
      previousYearSum.federdraht_sum += report.federdraht_sum;
      previousYearSum.draehte_sonstige_sum += report.draehte_sonstige_sum;
      previousYearSum.steel_sum += report.steel_sum;
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
   * Fasst die unterschiedlichen Stahl Produkte in zugehörige Kathegorien zusammen
   * @param data Stahl Meldung die Zusammengefasst werden soll
   * @returns Zusammengefasste Stahl Meldung
   */
  summarizeSteelReport(data: SteelReport[]): SummarizedSteelReport[] {
    const summarizedReport: SummarizedSteelReport[] = [];

    data.forEach(item => {
      const existingSummary = summarizedReport.find(summary => summary.reportDate === item.reportDate);

      if (existingSummary) {
        existingSummary.seildraht_inland += item.seildraht_inland;
        existingSummary.federdraht_inland += item.federdraht_SH_SL_SM_inland + item.federdraht_DH_DM_inland
          + item.federdraht_sonstig_inland;
        existingSummary.draehte_sonstige_inland += item.polsterfederdraht_inland + item.draehte_sonstige_inland;

        existingSummary.steel_inland_sum += existingSummary.seildraht_inland + existingSummary.federdraht_inland
          + existingSummary.draehte_sonstige_inland;

        existingSummary.seildraht_export += item.seildraht_export;
        existingSummary.federdraht_export += item.federdraht_SH_SL_SM_export + item.federdraht_DH_DM_export
          + item.federdraht_sonstig_export;
        existingSummary.draehte_sonstige_export += item.polsterfederdraht_export + item.draehte_sonstige_export;

        existingSummary.steel_export_sum += existingSummary.seildraht_export + existingSummary.federdraht_export
          + existingSummary.draehte_sonstige_export;

        existingSummary.seildraht_sum += existingSummary.seildraht_inland + existingSummary.seildraht_export;
        existingSummary.federdraht_sum += existingSummary.federdraht_inland + existingSummary.federdraht_export;
        existingSummary.draehte_sonstige_sum += existingSummary.draehte_sonstige_inland + existingSummary.draehte_sonstige_export;
        existingSummary.steel_sum += existingSummary.steel_inland_sum + existingSummary.steel_export_sum;
      } else {
        const newSummary: SummarizedSteelReport = {
          reportDate: item.reportDate,

          seildraht_inland: item.seildraht_inland,
          federdraht_inland: item.federdraht_SH_SL_SM_inland + item.federdraht_DH_DM_inland
            + item.federdraht_sonstig_inland,
          draehte_sonstige_inland: item.polsterfederdraht_inland + item.draehte_sonstige_inland,

          steel_inland_sum: item.seildraht_inland + item.federdraht_SH_SL_SM_inland + item.federdraht_DH_DM_inland
            + item.federdraht_sonstig_inland + item.polsterfederdraht_inland + item.draehte_sonstige_inland,

          seildraht_export: item.seildraht_export,
          federdraht_export: item.federdraht_SH_SL_SM_export + item.federdraht_DH_DM_export
            + item.federdraht_sonstig_export,
          draehte_sonstige_export: item.polsterfederdraht_export + item.draehte_sonstige_export,

          steel_export_sum: item.seildraht_export + item.federdraht_SH_SL_SM_export + item.federdraht_DH_DM_export
            + item.federdraht_sonstig_export + item.polsterfederdraht_export + item.draehte_sonstige_export,

          seildraht_sum: item.seildraht_inland + item.seildraht_export,
          federdraht_sum: item.federdraht_SH_SL_SM_inland + item.federdraht_DH_DM_inland
            + item.federdraht_sonstig_inland + item.federdraht_SH_SL_SM_export + item.federdraht_DH_DM_export
            + item.federdraht_sonstig_export,
          draehte_sonstige_sum: item.polsterfederdraht_inland + item.draehte_sonstige_inland
            + item.polsterfederdraht_export + item.draehte_sonstige_export,

          steel_sum: item.seildraht_inland + item.federdraht_SH_SL_SM_inland + item.federdraht_DH_DM_inland
            + item.federdraht_sonstig_inland + item.polsterfederdraht_inland + item.draehte_sonstige_inland
            + item.seildraht_export + item.federdraht_SH_SL_SM_export + item.federdraht_DH_DM_export
            + item.federdraht_sonstig_export + item.polsterfederdraht_export + item.draehte_sonstige_export,
        };

        summarizedReport.push(newSummary);
      }
    });

    return summarizedReport;
  }
}
