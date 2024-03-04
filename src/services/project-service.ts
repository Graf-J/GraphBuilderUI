import { HttpResponse } from "@/models/http/http-response";
import { HttpResponseType } from "@/models/http/http-response-type";
import { ProjectResponse } from "@/models/response/project-response-model";

export async function getProjects(): Promise<HttpResponse<ProjectResponse[]>> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/projects`, {
            cache: 'no-store',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const result = await response.json()

        if (!response.ok) {
            return {
                type: HttpResponseType.GENERAL_ERROR,
                generalErrorMessage: 'Unknown Error',
                fieldErrors: null,
                response: null
            } as HttpResponse<ProjectResponse[]>
        }

        return {
            type: HttpResponseType.SUCCESS,
            generalErrorMessage: null,
            fieldErrors: null,
            response: result
        } as HttpResponse<ProjectResponse[]>
    } catch (error) {
        throw error;
    }
}

export async function createProject(name: string): Promise<HttpResponse<ProjectResponse>> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        })
        const result = await response.json();

        if (!response.ok) {
            if (response.status === 409) {
                return {
                    type: HttpResponseType.GENERAL_ERROR,
                    generalErrorMessage: result.detail[0].msg,
                    fieldErrors: null,
                    response: null
                } as HttpResponse<ProjectResponse>
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
                } as HttpResponse<ProjectResponse>
            } else {
                return {
                    type: HttpResponseType.GENERAL_ERROR,
                    generalErrorMessage: "Unknown Error",
                    fieldErrors: null,
                    response: null
                } as HttpResponse<ProjectResponse>
            }
        }

        return {
            type: HttpResponseType.SUCCESS,
            generalErrorMessage: null,
            fieldErrors: null,
            response: result
        } as HttpResponse<ProjectResponse>
    } catch (error) {
        throw error;
    }
}

export async function deleteProject(projectId: string, deleteOutput: boolean): Promise<HttpResponse<void>> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/projects/${projectId}?delete_output=${deleteOutput}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
    
        if (!response.ok) {
            return {
                type: HttpResponseType.GENERAL_ERROR,
                generalErrorMessage: 'Unknown Error',
                fieldErrors: null,
                response: null
            } as HttpResponse<void>
        }
    
        return {
            type: HttpResponseType.SUCCESS,
            generalErrorMessage: null,
            fieldErrors: null,
            response: null
        } as HttpResponse<void>
    } catch (error) {
        throw error;
    }
}