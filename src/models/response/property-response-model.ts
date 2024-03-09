import { Datatype } from "../common/datatype-enum";

export interface PropertyResponse {
    key: string;
    required: boolean;
    datatype: Datatype;
}