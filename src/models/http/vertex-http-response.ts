import { HttpResponseType } from "./http-response-type";
import { FieldError } from "./field-error";
import { VertexResponse } from "../response/vertex-response-model";

export interface VertexHttpResponse {
    type: HttpResponseType;
    generalErrorMessage: string | null;
    fieldErrors: FieldError[] | null;
    response: VertexResponse | null;
}