/**
 * Model für Mitglieder des ESV
 * ID: Kürzel des Mitglieds
 * name: Name des Mitglieds, bei mehreren Standorten: Name des Werkes
 * gruppe: Bei mehreren Standorten die Zugehörigkeit des Werkes, sonst leer
 * debNr: Debitor Nummer des Mitglieds
 * street, houseNr, zip, city, country: Adresse des Mitglieds
 */
export class Member {
    ID: string;
    name: string;
    group?: string;
    debNr: number | undefined;
    address: MemberAddress;
    grundbeitrag: boolean = false;

    constructor(ID: string = "", name: string = "", group?: string, debNr?: number, street: string = "", zipCode?: number, city: string = "", country?: string, grundbeitrag: boolean = false) {
        this.ID = ID;
        this.name = name;
        this.grundbeitrag = grundbeitrag;
        this.address = new MemberAddress(street, zipCode, city, country);
        if(group) {
            this.group = group;
        }
        if(debNr) {
            this.debNr = debNr;
        }
    }

    public static fromJSON(json: any): Member {
        const { ID, name, debNr, address, group, grundbeitrag } = json;
        const { street, zipCode, city, country } = address;
        return new Member(ID, name, group, debNr, street, zipCode, city, country, grundbeitrag);
    }
}


/**
 * Model für die Adresse eines Mitglieds
 */
export class MemberAddress {
    street: string;
    zipCode: number | undefined;
    city: string;
    country?: string;

    constructor(street: string = "", zipCode?: number, city: string = "", country?: string) {
        this.street = street;
        this.city = city;
        if(country) {
            this.country = country;
        }
        if(zipCode){
            this.zipCode = zipCode;
        }
    }

    printAddress(): string {
        let adress = this.street + " - " + this.zipCode + " - " + this.city;
        if(this.country) {
            adress += ", " + this.country;
        }
        return adress
    }
}