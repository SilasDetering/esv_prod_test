import { Member } from "./member.model";
import { IronReport, SteelReport } from "./report.model";

export class Invoice {

    public company: Member
    public reportDate: string

    public report: SteelReport | IronReport
    public inland_tonnes: number
    public export_tonnes: number
    public inland_bill: number
    public export_bill: number

    public total_bill: number
    public budget_over_max_contribution: number

    public list_of_missing_reports: Array<string>       // Enthält alle Fehlenden Eisen oder Stahlmeldungen aus vorherigen Monaten um auf evtl. Fehler hinzuweisen
    
    constructor(
        company: Member, reportDate: string, report: IronReport | SteelReport, inland_tonnes: number, 
        export_tonnes: number, inland_bill: number, export_bill: number, total_bill: number, 
        budget_over_max_contribution: number, list_of_missing_reports: Array<string>,
    ){
        this.company = company;
        this.reportDate = reportDate;
        this.report = report;
        this.inland_tonnes = inland_tonnes;
        this.export_tonnes = export_tonnes;
        this.inland_bill = inland_bill;
        this.export_bill = export_bill;
        this.total_bill = total_bill;
        this.budget_over_max_contribution = budget_over_max_contribution;
        this.list_of_missing_reports = list_of_missing_reports;
    }
}