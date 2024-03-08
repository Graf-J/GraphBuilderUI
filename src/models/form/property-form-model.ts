import { Property } from "../application/property";
import { Datatype } from "../common/datatype-enum";
import { v4 as uuidv4 } from 'uuid';

export class FormProperty {
    constructor(
        public id: string,
        public key: string,
        public required: boolean,
        public datatype: Datatype,
        public errorMessage: string
    ) {}

    public static empty(): FormProperty {
        return new FormProperty(
            uuidv4(),
            '',
            true,
            Datatype.String,
            ''
        )
    }

    public static fromProperty(property: Property): FormProperty {
        return new FormProperty(
            uuidv4(),
            property.key,
            property.required,
            property.datatype,
            ''
        )
    }
}