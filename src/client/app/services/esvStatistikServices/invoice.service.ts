import { Injectable } from '@angular/core';
import { Invoice } from '../../models/invoice.model';
import { Member } from '../../models/member.model';
import { IronReport, SteelReport } from '../../models/report.model';
import { HelperService } from '../helperServices/helper.service';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(private helper: HelperService) { }

  maxContribution = 40000
  pricePerTonneIron = 1.10
  pricePerTonneSteel = 1.10
  grundbeitrag = 200

  /**
   * Berechnet eine Rechnung für Eisenmeldungen
   * @param member Mitglied für das die Rechnung berechnet werden soll 
   * @param date Monat (JJJJ-MM-TT) für die Rechnung
   * @param listOfIronReports Liste aller Eisenmeldungen eines Jahres
   * @param listOfSteelReports Liste aller Stahlmeldungen eines Jahres
   * @returns Eisenrechnung für das gewählte Mitglied und Datum
   */
  generateIronInvoice(member: Member, group: Member[], date: string, listOfIronReports: IronReport[], listOfSteelReports: SteelReport[]): Invoice | undefined {

    if(!group || group.length == 0){
      group = [member]
    }

    const selectedIronReport = listOfIronReports.filter(report => report.reportDate == date && member.ID == report.companyID)[0]

    if(selectedIronReport == undefined) {
      return undefined
    }

    const inland_tonnes_iron = selectedIronReport.blumendraht_inland + selectedIronReport.flachdraht_inland + selectedIronReport.kettendraht_inland
      + selectedIronReport.npStahldraehte_inland + selectedIronReport.nietendraht_inland + selectedIronReport.schraubendraht_inland
      + selectedIronReport.ed_blank_verkupfert_inland + selectedIronReport.ed_geglueht_inland + selectedIronReport.ed_verzinkt_bis_6_inland
      + selectedIronReport.ed_verzinkt_ueber_6_inland + selectedIronReport.ed_verzinnt_inland + selectedIronReport.ed_kuststoffummantelt_inland
      + selectedIronReport.stangendraht_inland + selectedIronReport.sonstige_inland

    const export_tonnes_iron = selectedIronReport.blumendraht_export + selectedIronReport.flachdraht_export + selectedIronReport.kettendraht_export
      + selectedIronReport.npStahldraehte_export + selectedIronReport.nietendraht_export + selectedIronReport.schraubendraht_export
      + selectedIronReport.ed_blank_verkupfert_export + selectedIronReport.ed_geglueht_export + selectedIronReport.ed_verzinkt_bis_6_export
      + selectedIronReport.ed_verzinkt_ueber_6_export + selectedIronReport.ed_verzinnt_export + selectedIronReport.ed_kuststoffummantelt_export
      + selectedIronReport.stangendraht_export + selectedIronReport.sonstige_export

    const inland_bill_iron = inland_tonnes_iron * this.pricePerTonneIron
    const export_bill_iron = export_tonnes_iron * this.pricePerTonneIron
    let total_bill_iron = inland_bill_iron + export_bill_iron

    if (member.grundbeitrag) { total_bill_iron += this.grundbeitrag }

    console.log("repbill: "+total_bill_iron)

    const year_budget = this.calc_year_budget(date, listOfIronReports, listOfSteelReports)

    console.log("yearbudget: " + year_budget)

    const budget_over_max_contribution = this.calc_budget_over_max_contrib(year_budget, total_bill_iron)

    console.log("budgetovermax: " + budget_over_max_contribution)

    const total_bill = total_bill_iron - budget_over_max_contribution

    console.log("endBill: "+ total_bill)

    const missing_reports = this.search_missing_reports(group, date, listOfIronReports, listOfSteelReports)

    return new Invoice(member, date, selectedIronReport, inland_tonnes_iron, export_tonnes_iron, inland_bill_iron,
      export_bill_iron, total_bill, budget_over_max_contribution, missing_reports)
  }

  generateSteelInvoice(member: Member, group: Member[], date: string, listOfIronReports: IronReport[], listOfSteelReports: SteelReport[]): Invoice {
    
    const selectedSteelReport = listOfSteelReports.filter(report => report.reportDate == date)[0]

    const inland_tonnes_steel = selectedSteelReport.seildraht_inland + selectedSteelReport.polsterfederdraht_inland + selectedSteelReport.federdraht_SH_SL_SM_inland
    + selectedSteelReport.federdraht_DH_DM_inland + selectedSteelReport.federdraht_sonstig_inland + selectedSteelReport.draehte_sonstige_inland

    const export_tonnes_steel = selectedSteelReport.seildraht_export + selectedSteelReport.polsterfederdraht_export + selectedSteelReport.federdraht_SH_SL_SM_export
    + selectedSteelReport.federdraht_DH_DM_export + selectedSteelReport.federdraht_sonstig_export + selectedSteelReport.draehte_sonstige_export

    const inland_bill_steel = inland_tonnes_steel * this.pricePerTonneSteel
    const export_bill_steel = export_tonnes_steel * this.pricePerTonneSteel
    let total_bill_steel = inland_bill_steel + export_bill_steel

    if (member.grundbeitrag) { total_bill_steel += this.grundbeitrag }

    const year_budget = this.calc_year_budget(date, listOfIronReports, listOfSteelReports)
    const budget_over_max_contribution = this.calc_budget_over_max_contrib(year_budget, total_bill_steel)

    const total_bill = total_bill_steel - budget_over_max_contribution

    const missing_reports = this.search_missing_reports(group, date, listOfIronReports, listOfSteelReports)

    return new Invoice(member, date, selectedSteelReport, inland_tonnes_steel, export_tonnes_steel, inland_bill_steel,
      export_bill_steel, total_bill, budget_over_max_contribution, missing_reports)
  }
  	
  /**
   * Durchsucht die Liste von Mitgliedern in der Gruppe, um fehlende Berichte für Eisen- und Stahlmeldungen an einem bestimmten Datum zu identifizieren.
   * @param group Eine Liste von Mitgliedern, für die die fehlenden Berichte gesucht werden sollen.
   * @param date Das Datum, für das die Berichte gesucht werden sollen. Im Format 'YYYY-MM'.
   * @param listOfIronReports Eine Liste von vorhandenen Eisenberichten.
   * @param listOfSteelReports Eine Liste von vorhandenen Stahlberichten.
   * @returns Eine Liste von Meldungen über fehlende Berichte für jeden Benutzer in der Gruppe an dem angegebenen Datum.
   */
  search_missing_reports(group: Member[], date: string, listOfIronReports: IronReport[], listOfSteelReports: SteelReport[]) {
    const missingReports: string[] = [];
    const [year, month] = date.split('-');

    console.log(group)

    // Iteriere über jedes Mitglied in der Gruppe
    group.forEach(member => {

      const expectedIronReportDates = this.getExpectedDates(year, month);

      const expectedSteelReportDates = this.getExpectedDates(year, month);

      listOfIronReports.forEach(ironReport => {
        if (ironReport.companyID === member.ID) {
          expectedIronReportDates.delete(ironReport.reportDate);
        }
      });

      listOfSteelReports.forEach(steelReport => {
        if (steelReport.companyID === member.ID) {
          expectedSteelReportDates.delete(steelReport.reportDate);
        }
      });

      expectedIronReportDates.forEach(expectedDate => {
        missingReports.push(`Eisenmeldungen von ${member.name} am ${this.helper.getDateString(expectedDate)}`);
      });

      expectedSteelReportDates.forEach(expectedDate => {
        missingReports.push(`Stahlmeldungen von ${member.name} am ${this.helper.getDateString(expectedDate)}`);
      });
    });

    return missingReports;
  }

  /**
   * Berechnet den Wert umden der Maximalbeitrag mit dem aktuellen Bericht überstiegen wurde
   * @param year_budget Gesamtbeitrag eines Unternehmens in einem Jahr
   * @param report_bill Beitrag der durch den aktuellen Bericht zustande kommt
   * @returns Betrag über dem Maximalbeitrag
   */
  calc_budget_over_max_contrib(year_budget: number, report_bill: number): number {

    if (year_budget <= this.maxContribution) {
      return 0  // Der gesamte Jahresbeitrag ist gleich oder kleiner als der Maximalbeitrag
    } else if (year_budget - report_bill >= this.maxContribution) {
      return report_bill  // Der Jahresbeitrag ohne den aktuellen Bericht ist größer als der Maximalbeitrag
    } else {
      return year_budget - this.maxContribution // Der Jahresbeitrag übersteigt den Maximalbeitrag aufgrund des aktuellen Berichtes
    }
  }

  /**
   * Berechnet den Gesamtbeitrag alle Eisen- und Stahlberichte bis zu einem bestimmten Monat
   * @param date Monat bis zu dem der Gesamtbeitrag berechnet werden soll
   * @param listOfIronReports Liste von Eisenberichten
   * @param listOfSteelReports Liste von Stahlberichten
   * @returns Gesamtbeitrag
   */
  calc_year_budget(date: string, listOfIronReports: IronReport[], listOfSteelReports: SteelReport[]): number {
    let amount_of_iron = 0
    let amount_of_steel = 0
    let grundbeitraege = this.grundbeitrag
    const reportDate = new Date(date)

    listOfIronReports.forEach(rep => {
      const repDate = new Date(rep.reportDate)
      if (repDate <= reportDate) {
        amount_of_iron += rep.getSum()
      }
    });

    listOfSteelReports.forEach(rep => {
      const repDate = new Date(rep.reportDate)
      if (repDate <= reportDate) {
        amount_of_steel += rep.getSum()
      }
    });

    grundbeitraege *= reportDate.getMonth() + 1

    return amount_of_iron * this.pricePerTonneIron + amount_of_steel * this.pricePerTonneSteel + grundbeitraege
  }

  private getExpectedDates(year: string, month: string) {
    const months = [
      "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"
    ];
  
    const index = months.indexOf(month);
    const expectedDates = months.slice(0, index + 1).map(m => `${year}-${m}-01`);
  
    return new Set(expectedDates);
  }
}