import { Property } from "../application/property";
import { Datatype } from "../common/datatype-enum";
import { FormProperty } from "../form/property-form-model";

export class PropertyRequest {
    constructor(
        public key: string,
        public required: boolean,
        public datatype: Datatype
    ) {}

    public static fromForm(formProperty: FormProperty): PropertyRequest {
        return new PropertyRequest(
            formProperty.key,
            formProperty.required,
            formProperty.datatype
        )
    }

    public static fromProperty(property: Property): PropertyRequest {
        return new PropertyRequest(
            property.key,
            property.required,
            property.datatype
        )
    }
}