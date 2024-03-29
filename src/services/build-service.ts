import { HttpResponse } from "@/models/http/http-response";
import { HttpResponseType } from "@/models/http/http-response-type";
import { BuildRequest } from "@/models/request/build-request-model";

export async function buildProject(projectId: string, buildRequest: BuildRequest): Promise<HttpResponse<void>> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/projects/${projectId}/build`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(buildRequest)
        })
        const result = await response.json()

        return buildResponse(response, result)
    } catch (error) {
        throw error;
    }
}

function buildResponse(response: Response, result: any): HttpResponse<void> {
    if (!response.ok) {
        if (response.status === 409) {
            return {
                type: HttpResponseType.GENERAL_ERROR,
                generalErrorMessage: result.detail[0].msg,
                fieldErrors: null,
                response: null
            } as HttpResponse<void>
        } else if (response.status === 422) {
            return {
                type: HttpResponseType.FIELD_ERROR,
                generalErrorMessage: null,
                fieldErrors: result.detail.map((detail: any) => ({
                    field: detail.loc[1],
                    index: null,
                    message: detail.msg
                })),
                response: null
            } as HttpResponse<void>
        } else {
            return {
                type: HttpResponseType.GENERAL_ERROR,
                generalErrorMessage: "Unknown Error",
                fieldErrors: null,
                response: null
            } as HttpResponse<void>
        }
    }

    return {
        type: HttpResponseType.SUCCESS,
        generalErrorMessage: null,
        fieldErrors: null,
        response: null
    } as HttpResponse<void>
}