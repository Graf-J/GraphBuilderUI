import { HttpResponse } from "@/models/http/http-response";
import { HttpResponseType } from "@/models/http/http-response-type";
import { EdgeResponse } from "@/models/response/edge-response-model";
import { EdgeRequest } from "@/models/request/edge-request-model";

export async function addEdge(projectId: string, edgeRequest: EdgeRequest): Promise<HttpResponse<EdgeResponse>> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/projects/${projectId}/edges`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(edgeRequest)
        })
        const result = await response.json()
        
        return buildResponse(response, result)
    } catch (error) {
        throw error;
    }
}

export async function updateEdge(projectId: string, edgeId: string, edgeRequest: EdgeRequest): Promise<HttpResponse<EdgeResponse>> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/projects/${projectId}/edges/${edgeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(edgeRequest)
        })
        const result = await response.json()
        
        return buildResponse(response, result)
    } catch (error) {
        throw error;
    }
}

export async function deleteEdge(projectId: string, edgeId: string): Promise<HttpResponse<void>> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/projects/${projectId}/edges/${edgeId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            return {
                type: HttpResponseType.GENERAL_ERROR,
                generalErrorMessage: "Unknown Error",
                fieldErrors: null,
                response: null
            } as HttpResponse<void>;
        } else {
            return {
                type: HttpResponseType.SUCCESS,
                generalErrorMessage: null,
                fieldErrors: null,
                response: null
            } as HttpResponse<void>;
        }
    } catch (error) {
        throw error
    }
}


function buildResponse(response: Response, result: any): HttpResponse<EdgeResponse> {
    if (!response.ok) {
        if (response.status === 409) {
            return {
                type: HttpResponseType.GENERAL_ERROR,
                generalErrorMessage: result.detail[0].msg,
                fieldErrors: null,
                response: null
            } as HttpResponse<EdgeResponse>
        } else if (response.status === 422) {
            if (result.detail[0].loc[1] === 'properties' && result.detail[0].loc.length === 2) {
                return {
                    type: HttpResponseType.GENERAL_ERROR,
                    generalErrorMessage: result.detail[0].msg,
                    fieldErrors: null,
                    response: null
                } as HttpResponse<EdgeResponse>;
            }
            return {
                type: HttpResponseType.FIELD_ERROR,
                generalErrorMessage: null,
                fieldErrors: result.detail.map((detail: any) => ({
                    field: detail.loc[1],
                    index: detail.loc[1] === 'properties' ? detail.loc[2] : null,
                    message: detail.msg
                })),
                response: null
            } as HttpResponse<EdgeResponse>;
        } else {
            return {
                type: HttpResponseType.GENERAL_ERROR,
                generalErrorMessage: "Unknown Error",
                fieldErrors: null,
                response: null
            } as HttpResponse<EdgeResponse>;
        }
    }

    return {
        type: HttpResponseType.SUCCESS,
        generalErrorMessage: null,
        fieldErrors: null,
        response: result
    }
}