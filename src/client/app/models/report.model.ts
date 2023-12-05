import { Country } from "./country.model";

/**
 * Models für die Mitglieder-Meldungen. Jeweils für Eisen und Stahl meldungen. 
*/
export class IronReport {
    companyID: string
    reportDate: string
    insertDate: Date

    blumendraht_inland: number
    flachdraht_inland: number
    kettendraht_inland: number
    npStahldraehte_inland: number
    nietendraht_inland: number
    schraubendraht_inland: number
    ed_blank_verkupfert_inland: number
    ed_geglueht_inland: number
    ed_verzinkt_bis_6_inland: number
    ed_verzinkt_ueber_6_inland: number
    ed_verzinnt_inland: number
    ed_kuststoffummantelt_inland: number
    stangendraht_inland: number
    sonstige_inland: number

    blumendraht_export: number
    flachdraht_export: number
    kettendraht_export: number
    npStahldraehte_export: number
    nietendraht_export: number
    schraubendraht_export: number
    ed_blank_verkupfert_export: number
    ed_geglueht_export: number
    ed_verzinkt_bis_6_export: number
    ed_verzinkt_ueber_6_export: number
    ed_verzinnt_export: number
    ed_kuststoffummantelt_export: number
    stangendraht_export: number
    sonstige_export: number

    country_exports: Array<ExportReport>

    constructor(companyID: string, reportDate: string, insertDate: Date, 
        blumendraht_inland: number, flachdraht_inland: number, kettendraht_inland: number, npStahldraehte_inland: number, 
        nietendraht_inland: number, schraubendraht_inland: number, ed_blank_verkupfert_inland: number, ed_geglueht_inland: number, 
        ed_verzinkt_bis_6_inland: number, ed_verzinkt_ueber_6_inland: number, ed_verzinnt_inland: number, ed_kuststoffummantelt_inland: number, 
        stangendraht_inland: number, sonstige_inland: number,
        blumendraht_export: number, flachdraht_export: number, kettendraht_export: number, npStahldraehte_export: number, 
        nietendraht_export: number, schraubendraht_export: number, ed_blank_verkupfert_export: number, ed_geglueht_export: number, 
        ed_verzinkt_bis_6_export: number, ed_verzinkt_ueber_6_export: number, ed_verzinnt_export: number, ed_kuststoffummantelt_export: number, 
        stangendraht_export: number, sonstige_export: number,
        country_exports: Array<ExportReport>
    ){
        this.companyID = companyID;
        this.reportDate = reportDate;
        this.insertDate = insertDate;

        this.blumendraht_inland = blumendraht_inland;
        this.flachdraht_inland = flachdraht_inland;
        this.kettendraht_inland = kettendraht_inland;
        this.npStahldraehte_inland = npStahldraehte_inland;
        this.nietendraht_inland = nietendraht_inland;
        this.schraubendraht_inland = schraubendraht_inland;
        this.ed_blank_verkupfert_inland = ed_blank_verkupfert_inland;
        this.ed_geglueht_inland = ed_geglueht_inland;
        this.ed_verzinkt_bis_6_inland = ed_verzinkt_bis_6_inland;
        this.ed_verzinkt_ueber_6_inland = ed_verzinkt_ueber_6_inland;
        this.ed_verzinnt_inland = ed_verzinnt_inland;
        this.ed_kuststoffummantelt_inland = ed_kuststoffummantelt_inland;
        this.stangendraht_inland = stangendraht_inland;
        this.sonstige_inland = sonstige_inland;

        this.blumendraht_export = blumendraht_export;
        this.flachdraht_export = flachdraht_export;
        this.kettendraht_export = kettendraht_export;
        this.npStahldraehte_export = npStahldraehte_export;
        this.nietendraht_export = nietendraht_export;
        this.schraubendraht_export = schraubendraht_export;
        this.ed_blank_verkupfert_export = ed_blank_verkupfert_export;
        this.ed_geglueht_export = ed_geglueht_export;
        this.ed_verzinkt_bis_6_export = ed_verzinkt_bis_6_export;
        this.ed_verzinkt_ueber_6_export = ed_verzinkt_ueber_6_export;
        this.ed_verzinnt_export = ed_verzinnt_export;
        this.ed_kuststoffummantelt_export = ed_kuststoffummantelt_export;
        this.stangendraht_export = stangendraht_export;
        this.sonstige_export = sonstige_export;

        this.country_exports = country_exports;
    }

    public static __fromJSON__(json: any): IronReport {
        return new IronReport(
            json.companyID, json.reportDate, new Date(json.insertDate),
            json.blumendraht_inland, json.flachdraht_inland, json.kettendraht_inland, json.npStahldraehte_inland, json.nietendraht_inland, json.schraubendraht_inland, 
            json.ed_blank_verkupfert_inland, json.ed_geglueht_inland, json.ed_verzinkt_bis_6_inland, json.ed_verzinkt_ueber_6_inland, json.ed_verzinnt_inland, 
            json.ed_kuststoffummantelt_inland, json.stangendraht_inland, json.sonstige_inland,
            json.blumendraht_export, json.flachdraht_export, json.kettendraht_export, json.npStahldraehte_export, json.nietendraht_export, json.schraubendraht_export,
            json.ed_blank_verkupfert_export, json.ed_geglueht_export, json.ed_verzinkt_bis_6_export, json.ed_verzinkt_ueber_6_export, json.ed_verzinnt_export,
            json.ed_kuststoffummantelt_export, json.stangendraht_export, json.sonstige_export,
            json.country_exports.map((exportReport: any) => exportReport as ExportReport)       
        );
    }

    public static emptyIronReport(reportDate?: Date): IronReport {
        if(reportDate){
            return new IronReport(
                "", "", reportDate, 
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                new Array<ExportReport>()
            );
        }else{
            return new IronReport(
                "", "", new Date(), 
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                new Array<ExportReport>()
            );
        }
    }

    getInlandSum(): number {
        return this.blumendraht_inland + this.flachdraht_inland + this.kettendraht_inland + this.npStahldraehte_inland 
        + this.nietendraht_inland + this.schraubendraht_inland + this.ed_blank_verkupfert_inland + this.ed_geglueht_inland 
        + this.ed_verzinkt_bis_6_inland + this.ed_verzinkt_ueber_6_inland + this.ed_verzinnt_inland + this.ed_kuststoffummantelt_inland 
        + this.stangendraht_inland + this.sonstige_inland;
    }

    getExportSum(): number {
        return this.blumendraht_export + this.flachdraht_export + this.kettendraht_export + this.npStahldraehte_export 
        + this.nietendraht_export + this.schraubendraht_export + this.ed_blank_verkupfert_export + this.ed_geglueht_export 
        + this.ed_verzinkt_bis_6_export + this.ed_verzinkt_ueber_6_export + this.ed_verzinnt_export + this.ed_kuststoffummantelt_export 
        + this.stangendraht_export + this.sonstige_export;
    }

    getSum(): number {
        return this.getInlandSum() + this.getExportSum();
    }
}

export class SteelReport {
    companyID: string
    reportDate: string
    insertDate: Date

    seildraht_inland: number
    polsterfederdraht_inland: number
    federdraht_SH_SL_SM_inland: number
    federdraht_DH_DM_inland: number
    federdraht_sonstig_inland: number
    draehte_sonstige_inland: number

    seildraht_export: number
    polsterfederdraht_export: number
    federdraht_SH_SL_SM_export: number
    federdraht_DH_DM_export: number
    federdraht_sonstig_export: number
    draehte_sonstige_export: number

    country_exports: Array<ExportReport>

    constructor(companyID: string, reportDate: string, insertDate: Date,
        seildraht_inland: number, polsterfederdraht_inland: number, federdraht_SH_SL_SM_inland: number, federdraht_DH_DM_inland: number,
        federdraht_sonstig_inland: number, draehte_sonstige_inland: number,
        seildraht_export: number, polsterfederdraht_export: number, federdraht_SH_SL_SM_export: number, federdraht_DH_DM_export: number,
        federdraht_sonstig_export: number, draehte_sonstige_export: number,
        country_exports: Array<ExportReport>
    ){
        this.companyID = companyID;
        this.reportDate = reportDate;
        this.insertDate = insertDate;

        this.seildraht_inland = seildraht_inland;
        this.polsterfederdraht_inland = polsterfederdraht_inland;
        this.federdraht_SH_SL_SM_inland = federdraht_SH_SL_SM_inland;
        this.federdraht_DH_DM_inland = federdraht_DH_DM_inland;
        this.federdraht_sonstig_inland = federdraht_sonstig_inland;
        this.draehte_sonstige_inland = draehte_sonstige_inland;

        this.seildraht_export = seildraht_export;
        this.polsterfederdraht_export = polsterfederdraht_export;
        this.federdraht_SH_SL_SM_export = federdraht_SH_SL_SM_export;
        this.federdraht_DH_DM_export = federdraht_DH_DM_export;
        this.federdraht_sonstig_export = federdraht_sonstig_export;
        this.draehte_sonstige_export = draehte_sonstige_export;

        this.country_exports = country_exports;
    }

    public static emptySteelReport(reportDate?: Date): SteelReport {
        if(reportDate){
            return new SteelReport(
                "", "", reportDate,
                0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0,
                new Array<ExportReport>()
            );
        } else {
            return new SteelReport(
                "", "", new Date(),
                0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0,
                new Array<ExportReport>()
            );
        }
    }

    public static __fromJSON__(json: any): SteelReport {
        return new SteelReport(
            json.companyID, json.reportDate, new Date(json.insertDate),
            json.seildraht_inland, json.polsterfederdraht_inland, json.federdraht_SH_SL_SM_inland, json.federdraht_DH_DM_inland,
            json.federdraht_sonstig_inland, json.draehte_sonstige_inland, 
            json.seildraht_export, json.polsterfederdraht_export, json.federdraht_SH_SL_SM_export, json.federdraht_DH_DM_export,
            json.federdraht_sonstig_export, json.draehte_sonstige_export,
            json.country_exports.map((exportReport: any) => exportReport as ExportReport)
        );
    }

    getInlandSum(): number {
        return this.seildraht_inland + this.polsterfederdraht_inland + this.federdraht_SH_SL_SM_inland + this.federdraht_DH_DM_inland
        + this.federdraht_sonstig_inland + this.draehte_sonstige_inland;
    }

    getExportSum(): number {
        return this.seildraht_export + this.polsterfederdraht_export + this.federdraht_SH_SL_SM_export + this.federdraht_DH_DM_export
        + this.federdraht_sonstig_export + this.draehte_sonstige_export;
    }

    getSum(): number {
        return this.getInlandSum() + this.getExportSum();
    }
}

export interface SummarizedIronReport {
    reportDate: string,

    ed_blank_verkupfert_inland: number,
    ed_geglueht_inland: number,
    ed_verzinkt_inland: number,
    ed_verzinnt_inland: number,
    schraubendraht_inland: number,
    sonstige_inland: number,
    iron_inland_sum: number,

    ed_blank_verkupfert_export: number,
    ed_geglueht_export: number,
    ed_verzinkt_export: number,
    ed_verzinnt_export: number,
    schraubendraht_export: number,
    sonstige_export: number,
    iron_export_sum: number,
    
    ed_blank_verkupfert_sum: number,
    ed_geglueht_sum: number,
    ed_verzinkt_sum: number,
    ed_verzinnt_sum: number,
    schraubendraht_sum: number,
    sonstige_sum: number,
    iron_sum: number,
}

export interface SummarizedSteelReport {
    reportDate: string,

    seildraht_inland: number,
    federdraht_inland: number,
    draehte_sonstige_inland: number,
    steel_inland_sum: number,

    seildraht_export: number,
    federdraht_export: number,
    draehte_sonstige_export: number,
    steel_export_sum: number,

    seildraht_sum: number,
    federdraht_sum: number,
    draehte_sonstige_sum: number,
    steel_sum: number,
}

export class emptySummarizedIronReport implements SummarizedIronReport {
    reportDate: string = "0000-00-00";

    ed_blank_verkupfert_inland = 0;
    ed_geglueht_inland = 0;
    ed_verzinkt_inland = 0;
    ed_verzinnt_inland = 0;
    schraubendraht_inland = 0;
    sonstige_inland = 0;
    iron_inland_sum = 0;

    ed_blank_verkupfert_export = 0;
    ed_geglueht_export = 0;
    ed_verzinkt_export = 0;
    ed_verzinnt_export = 0;
    schraubendraht_export = 0;
    sonstige_export = 0;
    iron_export_sum = 0;

    ed_blank_verkupfert_sum = 0;
    ed_geglueht_sum = 0;
    ed_verzinkt_sum = 0;
    ed_verzinnt_sum = 0;
    schraubendraht_sum = 0;
    sonstige_sum = 0;
    iron_sum = 0;

    constructor(reportDate?: string){
        if(!reportDate){
            this.reportDate = "0000-00-00";
        }else{
            this.reportDate = reportDate;
        }
    }
}

export class emptySummarizedSteelReport implements SummarizedSteelReport {
    reportDate: string = "0000-00-00";

    seildraht_inland = 0;
    federdraht_inland = 0;
    draehte_sonstige_inland = 0;
    steel_inland_sum = 0;

    seildraht_export = 0;
    federdraht_export = 0;
    draehte_sonstige_export = 0;
    steel_export_sum = 0;

    seildraht_sum = 0;
    federdraht_sum = 0;
    draehte_sonstige_sum = 0;
    steel_sum = 0;

    constructor(reportDate?: string){
        if(!reportDate){
            this.reportDate = "0000-00-00";
        }else{
            this.reportDate = reportDate;
        }
    }
}

export interface ExportReport {
    countryID: string,
    countryName: string,
    amount: number,
    name: string,
}

export interface ExportList {
    companyID: string,
    amount: number,
    country: Country,
}