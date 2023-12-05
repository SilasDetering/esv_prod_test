/*
    Model für die Marktansicht in der Import-Übersicht
*/
export class MarketReport {
    inlandsversand: Map<string, number>
    importe: Map<string, number>
    numberOfMonths: number = 0;

    constructor(inlandsversand: Map<string, number>, importe: Map<string, number>) {
        this.inlandsversand = inlandsversand
        this.importe = importe
    }

    get_Inlandsversand(key: string): string {
        const value = this.inlandsversand.get(key);
        if (value === undefined) {
            return "";
        } else {
            return this.round(value);
        }
    }

    get_Importe(key: string): string {
        const value = this.importe.get(key);
        if (value === undefined) {
            return "";
        } else {
            return this.round(value);
        }
    }

    get_Inlandsversand_percent(key: string): string {
        const inlandsversand = this.inlandsversand.get(key);
        const importe = this.importe.get(key);
        if (inlandsversand === undefined || importe === undefined || inlandsversand+importe == 0) {
            return "";
        } else {
            return (inlandsversand / (inlandsversand + importe) * 100).toFixed(2);
        }
    }

    get_Importe_percent (key: string): string {
        const inlandsversand = this.inlandsversand.get(key);
        const importe = this.importe.get(key);
        if (inlandsversand === undefined || importe === undefined || inlandsversand+importe == 0) {
            return "";
        } else {
            return (importe / (inlandsversand + importe) * 100).toFixed(2);
        }
    }

    get_Marktversorgung(key: string): string {
        const inlandsversand = this.inlandsversand.get(key);
        const importe = this.importe.get(key);
        if (inlandsversand === undefined || importe === undefined) {
            return "";
        } else {
            return this.round(inlandsversand + importe);
        }
    }

    get_Importe_avg(): string {
        if(this.numberOfMonths > 0 && this.importe.get("1. Halbjahr") !== undefined && this.importe.get("2. Halbjahr") !== undefined) {
            let sum = this.importe.get("1. Halbjahr")! + this.importe.get("2. Halbjahr")!;
            return this.round(sum / this.numberOfMonths);
        }
        return "";
    }

    get_Inlandsversand_avg(): string {
        if(this.numberOfMonths > 0 && this.inlandsversand.get("1. Halbjahr") !== undefined && this.inlandsversand.get("2. Halbjahr") !== undefined) {
            let sum = this.inlandsversand.get("1. Halbjahr")! + this.inlandsversand.get("2. Halbjahr")!;
            return this.round(sum / this.numberOfMonths);
        }
        return "";
    }

    get_Marktversorgung_avg(): string {
        if(this.numberOfMonths > 0 && this.importe.get("1. Halbjahr") !== undefined && this.importe.get("2. Halbjahr") !== undefined && this.inlandsversand.get("1. Halbjahr") !== undefined && this.inlandsversand.get("2. Halbjahr") !== undefined) {
            let sum = this.importe.get("1. Halbjahr")! + this.importe.get("2. Halbjahr")! + this.inlandsversand.get("1. Halbjahr")! + this.inlandsversand.get("2. Halbjahr")!;
            return this.round(sum / this.numberOfMonths);
        }
        return "";
    }

    get_Inlandsversand_percent_avg(): string {
        if(this.numberOfMonths > 0 && this.inlandsversand.get("1. Halbjahr") !== undefined && this.inlandsversand.get("2. Halbjahr") !== undefined && this.importe.get("1. Halbjahr") !== undefined && this.importe.get("2. Halbjahr") !== undefined) {
            
            let avg_inlandsversand = (this.inlandsversand.get("1. Halbjahr")! + this.inlandsversand.get("2. Halbjahr")!) / this.numberOfMonths;
            let avg_importe = (this.importe.get("1. Halbjahr")! + this.importe.get("2. Halbjahr")!) / this.numberOfMonths;
            let avg_gesamt = avg_inlandsversand + avg_importe;

            if(avg_gesamt > 0){
                return (avg_inlandsversand / avg_gesamt * 100).toFixed(2);
            } else {
                return "";
            }
        }
        return "";
    }

    get_Importe_percent_avg(): string {
        if(this.numberOfMonths > 0 && this.inlandsversand.get("1. Halbjahr") !== undefined && this.inlandsversand.get("2. Halbjahr") !== undefined && this.importe.get("1. Halbjahr") !== undefined && this.importe.get("2. Halbjahr") !== undefined) {
            
            let avg_inlandsversand = (this.inlandsversand.get("1. Halbjahr")! + this.inlandsversand.get("2. Halbjahr")!) / this.numberOfMonths;
            let avg_importe = (this.importe.get("1. Halbjahr")! + this.importe.get("2. Halbjahr")!) / this.numberOfMonths;
            let avg_gesamt = avg_inlandsversand + avg_importe;

            if(avg_gesamt > 0){
                return (avg_importe / avg_gesamt * 100).toFixed(2);
            } else {
                return "";
            }
        }
        return "";
    }

    get_numberOfMonths(): string {
        return this.numberOfMonths.toString();
    }

    set_numberOfMonths(numberOfMonths: number): void {
        if(numberOfMonths >= 0 && numberOfMonths <= 12){
            this.numberOfMonths = numberOfMonths;
        }
    }

    round(value: number): string{
        return (Math.round((value + Number.EPSILON) * 100) / 100).toString();
    }
}
