import { Datatype } from "./datatype-enum";

export interface Property {
    key: string;
    required: boolean;
    datatype: Datatype
}