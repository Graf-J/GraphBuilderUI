import { ChangeEvent, useEffect, useState } from 'react';
import { Button, Input } from "@nextui-org/react";
import { PropertyResponse } from "@/models/response/property-response-model";
import { addVertex, deleteVertex, updateVertex } from '@/services/vertex-service';
import { HttpResponseType } from '@/models/http/http-response-type';
import { HttpResponse } from '@/models/http/http-response';
import { VertexResponse } from '@/models/response/vertex-response-model';
import { toast } from 'react-hot-toast';
import { useGraphStore } from '@/store/graph-store';
import { Vertex } from '@/models/application/vertex';
import { FormVertex } from '@/models/form/vertex-form-model';
import { FieldError } from '@/models/http/field-error';
import { FormProperty } from '@/models/form/property-form-model';
import { VertexRequest } from '@/models/request/vertex-request-model';
import PropertyInputList from '@/components/property-input-list';


export default function VertexForm({ projectId }: { projectId: string }) {
    const [vertexFormValues, setVertexFormValues] = useState<FormVertex>(FormVertex.empty());

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { 
        graph,
        selectedVertex,
        resetSelectedVertex,
        addVertex: addVertexToStore, 
        updateVertex: updateVertexInStore, 
        deleteVertex: deleteVertexFromStore 
    } = useGraphStore();

    // Initial Load of the Input Fields
    useEffect(() => {
        if (selectedVertex) {
            setVertexFormValues(selectedVertex);
        } else {
            setVertexFormValues(FormVertex.empty());
        }
    }, [selectedVertex]);

    // Button Click Handlers
    const handleCreateVertexSubmit = async () => {
        try {
            setIsLoading(true)
            const { x, y } = calculateNewVertexPosition();
            const res = await addVertex(projectId, VertexRequest.fromFormWithPosition(vertexFormValues, x, y))
            evaluateHttpResponse(res, 'create');
        } catch (error) {
            toast.error('Internal Server Error');
        } finally {
            setIsLoading(false);
        }
    };

    const calculateNewVertexPosition = (): { x: number, y: number }  => {
        if (graph!.vertices.length === 0) {
            // Place at this position if it is the first Vertex
            return { x: 600, y: 400 }
        } else if (graph!.vertices.length === 1) {
            // Place it next to the first Vertex if it is the second Vertex
            const existingVertex: Vertex = graph!.vertices[0]
            return { x: existingVertex.positionX + 200, y: existingVertex.positionY }
        } else {
            // Place it in the center between all the existing Vertices
            let sumX = 0;
            let sumY = 0;
            graph!.vertices.forEach((vertex: Vertex) => {
                sumX += vertex.positionX;
                sumY += vertex.positionY;
            })
            const centerX = Math.round(sumX / graph!.vertices.length);
            const centerY = Math.round(sumY / graph!.vertices.length);

            return { x: centerX, y: centerY };
        }
    }

    const handleUpdateVertexSubmit = async () => {
        try {
            setIsLoading(true)
            const res = await updateVertex(projectId, selectedVertex!.id!, VertexRequest.fromForm(vertexFormValues));
            evaluateHttpResponse(res, 'update');
        } catch (error) {
            toast.error('Internal Server Error');
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteVertexSubmit = async () => {
        try {
            setIsLoading(true)
            const res = await deleteVertex(projectId, selectedVertex!.id!);
            
            if (res.type !== HttpResponseType.SUCCESS) {
                toast.error(res.generalErrorMessage)
            } else {
                deleteVertexFromStore(selectedVertex!.id!)
                toast.success("Successfully deleted Vertex");
                resetSelectedVertex();
            }
        } catch (error) {
            toast.error('Internal Server Error');
        } finally {
            setIsLoading(false)
        }
    }

    const evaluateHttpResponse = (res: HttpResponse<VertexResponse>, operation: string) => {
        if (res.type === HttpResponseType.GENERAL_ERROR) {
            toast.error(res.generalErrorMessage);
        } else if (res.type === HttpResponseType.FIELD_ERROR) {
            res.fieldErrors?.forEach((fieldError: FieldError) => {
                if (fieldError.field === 'name') {
                    setVertexFormValues((prevValues: FormVertex) => {
                        return { ...prevValues, nameErrorMessage: fieldError.message }
                    })
                } else if (fieldError.field === 'properties') {
                    setVertexFormValues((prevValues: FormVertex) => {
                        const newProperties = [...prevValues.properties]
                        newProperties[fieldError.index!] = {
                            ...newProperties[fieldError.index!],
                            errorMessage: fieldError.message
                        }

                        return { ...prevValues, properties: newProperties }
                    })
                }
            })
        } else {
            if (operation === 'create') {
                addVertexToStore(Vertex.fromResponse(res.response!));
                toast.success('Successfully created Vertex');
                setVertexFormValues(FormVertex.empty());
            } else if (operation === 'update') {
                updateVertexInStore(Vertex.fromResponse(res.response!));
                toast.success('Successfully updated Vertex');
            }
        }
    }

    // On Input Value Change Handlers
    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        setVertexFormValues({ ...vertexFormValues, name: e.target.value, nameErrorMessage: '' })
    }

    const handleAddProperty = () => {
        setVertexFormValues((prevValues: FormVertex) => {
            return {
                ...prevValues,
                properties: [...prevValues.properties, FormProperty.empty()]
            }
        })
    };

    const handleDeleteProperty = (index: number) => {
        setVertexFormValues((prevValues: FormVertex) => {
            const newProperties = prevValues.properties.filter((_, i) => i !== index);
            return { ...prevValues, properties: newProperties };
        });
    }

    const handlePropertyChange = (index: number, field: keyof PropertyResponse, value: string | boolean) => {
        setVertexFormValues((prevValues: FormVertex) => {
            const newProperties = [...prevValues.properties];

            let updatedProperty;
            if (field === 'datatype') {
                updatedProperty = { ...newProperties[index], [field]: value === "" ? 'String' : value, errorMessage: "" } as FormProperty;
            } else {
                updatedProperty = { ...newProperties[index], [field]: value, errorMessage: "" } as FormProperty;
            }

            newProperties[index] = updatedProperty;
            return { ...prevValues, properties: newProperties };
        });
    };

    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex flex-col w-full h-full overflow-hidden">
                <Input
                    isRequired
                    type="text"
                    label="Name"
                    variant="bordered"
                    value={vertexFormValues.name}
                    isInvalid={vertexFormValues.nameErrorMessage !== ''}
                    errorMessage={vertexFormValues.nameErrorMessage}
                    onChange={handleNameChange}
                    className="bg-gray-100 dark:bg-gray-700 rounded-xl mt-5"
                />

                <div className="inline-flex mt-5">
                    <Button color="secondary" variant="ghost" onClick={handleAddProperty}>
                        Add Property
                    </Button>
                </div>

                <div className="overflow-auto h-[calc(100vh-370px)]">
                    <PropertyInputList 
                        properties={vertexFormValues.properties}
                        handlePropertyChange={handlePropertyChange}
                        handleDeleteProperty={handleDeleteProperty}
                    />
                </div>
            </div>
            
            <div className="fixed bottom-6 left-5 flex w-full" style={{ width: 480 }}>
                { selectedVertex ? 
                <div className="w-full flex">
                    <Button isDisabled={isLoading} color="warning" variant="ghost" onClick={handleUpdateVertexSubmit} className="flex-1 mr-2">
                        Update Vertex
                    </Button>
                    <Button isDisabled={isLoading} color="danger" variant="ghost" onClick={handleDeleteVertexSubmit} className="flex-1">
                        Delete Vertex
                    </Button>
                </div> :
                <Button isLoading={isLoading} color="success" variant="ghost" onClick={handleCreateVertexSubmit} className="flex-1">
                    Create Vertex
                </Button> 
                }
            </div>
        </div>
    );
}