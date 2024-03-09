import { HttpResponse } from "@/models/http/http-response"
import { HttpResponseType } from "@/models/http/http-response-type"
import { GraphResponse } from "@/models/response/graph-response-model"

export async function getGraph(projectId: string): Promise<HttpResponse<GraphResponse>> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/projects/${projectId}/graph`, {
            cache: 'no-store',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        const result = await response.json()

        return buildResponse(response, result)
    } catch (error) {
        throw error
    }
}

function buildResponse(response: Response, result: any): HttpResponse<GraphResponse> {
    if (!response.ok) {
        if (response.status === 404) {
            return {
                type: HttpResponseType.GENERAL_ERROR,
                generalErrorMessage: result.detail[0].msg,
                fieldErrors: null,
                response: null
            } as HttpResponse<GraphResponse>
        } else {
            return {
                type: HttpResponseType.GENERAL_ERROR,
                generalErrorMessage: "Unknown Error",
                fieldErrors: null,
                response: null
            } as HttpResponse<GraphResponse>
        }
    }

    return {
        type: HttpResponseType.SUCCESS,
        generalErrorMessage: null,
        fieldErrors: null,
        response: result
    }
}