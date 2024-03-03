import { Property } from "@/models/property-model";
import { HttpResponse } from "@/models/http/http-response";
import { HttpResponseType } from "@/models/http/http-response-type";
import { VertexResponse } from "@/models/response/vertex-response-model";

export function addVertex(projectId: string, name: string, radius: number, properties: Property[], position_x: number, position_y: number): Promise<HttpResponse<VertexResponse>> {
    const newVertex = {
        name,
        properties,
        radius,
        position_x,
        position_y,
    }

    return fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/projects/${projectId}/vertices`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newVertex)
    })
        .then(response => {
            if (!response.ok) {
                if (response.status === 409) {
                    return response.json().then(error => {
                        return {
                            type: HttpResponseType.GENERAL_ERROR,
                            generalErrorMessage: error.detail[0].msg,
                            fieldErrors: null,
                            response: null
                        } as HttpResponse<VertexResponse>;
                    });
                } else if (response.status === 422) {
                    return response.json().then(error => {
                        if (error.detail[0].loc[1] === 'properties' && error.detail[0].loc.length === 2) {
                            return {
                                type: HttpResponseType.GENERAL_ERROR,
                                generalErrorMessage: error.detail[0].msg,
                                fieldErrors: null,
                                response: null
                            } as HttpResponse<VertexResponse>;
                        }
                        return {
                            type: HttpResponseType.FIELD_ERROR,
                            generalErrorMessage: null,
                            fieldErrors: error.detail.map((detail: any) => ({
                                field: detail.loc[1],
                                index: detail.loc[1] === 'properties' ? detail.loc[2] : null,
                                message: detail.msg
                            })),
                            response: null
                        } as HttpResponse<VertexResponse>;
                    })
                }
            }
            
            return response.json().then(data => {
                return {
                    type: HttpResponseType.SUCCESS,
                    generalErrorMessage: null,
                    fieldErrors: null,
                    response: data
                } as HttpResponse<VertexResponse>;
            });
        })
        .then(data => {
            return data;
        })
        .catch(error => {
            console.error(error)
            throw error
        });
}

export function updateVertex(projectId: string, vertexId: string, name: string, radius: number, properties: Property[], position_x: number, position_y: number) {
    const newVertex = {
        name: name,
        properties: properties,
        radius: radius,
        position_x: position_x,
        position_y: position_y
    }

    return fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/projects/${projectId}/vertices/${vertexId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newVertex)
    })
        .then(response => {
            if (!response.ok) {
                if (response.status === 409) {
                    return response.json().then(error => {
                        return {
                            type: HttpResponseType.GENERAL_ERROR,
                            generalErrorMessage: error.detail[0].msg,
                            fieldErrors: null,
                            response: null
                        } as HttpResponse<VertexResponse>;
                    });
                } else if (response.status === 422) {
                    return response.json().then(error => {
                        if (error.detail[0].loc[1] === 'properties' && error.detail[0].loc.length === 2) {
                            return {
                                type: HttpResponseType.GENERAL_ERROR,
                                generalErrorMessage: error.detail[0].msg,
                                fieldErrors: null,
                                response: null
                            } as HttpResponse<VertexResponse>;
                        }
                        return {
                            type: HttpResponseType.FIELD_ERROR,
                            generalErrorMessage: null,
                            fieldErrors: error.detail.map((detail: any) => ({
                                field: detail.loc[1],
                                index: detail.loc[1] === 'properties' ? detail.loc[2] : null,
                                message: detail.msg
                            })),
                            response: null
                        } as HttpResponse<VertexResponse>;
                    })
                }
            }
            
            return response.json().then(data => {
                return {
                    type: HttpResponseType.SUCCESS,
                    generalErrorMessage: null,
                    fieldErrors: null,
                    response: data
                } as HttpResponse<VertexResponse>;
            });
        })
        .then(data => {
            return data;
        })
        .catch(error => {
            console.error(error)
            throw error
        });
}

export function deleteVertex(projectId: string, vertexId: string) {
    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/projects/${projectId}/vertices/${vertexId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
        })
        .catch((error) => {
          console.error('Error deleting vertex:', error);
        });
}