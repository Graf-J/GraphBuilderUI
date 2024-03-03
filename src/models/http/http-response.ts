import { HttpResponseType } from "./http-response-type";
import { FieldError } from "./field-error";

export interface HttpResponse<T> {
    type: HttpResponseType;
    generalErrorMessage: string | null;
    fieldErrors: FieldError[] | null;
    response: T | null;
}