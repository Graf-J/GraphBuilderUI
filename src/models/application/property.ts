import { Datatype } from "../common/datatype-enum";
import { PropertyResponse } from "../response/property-response-model";

export class Property {
    constructor(
        public key: string,
        public required: boolean,
        public datatype: Datatype
    ) {}

    public static fromResponse(property: PropertyResponse): Property {
        return new Property(
            property.key,
            property.required,
            property.datatype
        )
    }
}