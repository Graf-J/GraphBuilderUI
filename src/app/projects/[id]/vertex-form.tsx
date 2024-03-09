import { ChangeEvent, useEffect, useState } from 'react';
import { Button, Input, Switch, Tooltip, Select, SelectItem } from "@nextui-org/react";
import { motion, AnimatePresence } from 'framer-motion'
import { PropertyResponse } from "@/models/response/property-response-model";
import { DeleteIcon } from "./delete-icon";
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


export default function VertexForm({ projectId, graphCenter }: any) {
    const [vertexFormValues, setVertexFormValues] = useState<FormVertex>(FormVertex.empty());

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { 
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
            console.log(vertexFormValues);
            const res = await addVertex(projectId, VertexRequest.fromFormWithPosition(vertexFormValues, graphCenter.x, graphCenter.y))
            evaluateHttpResponse(res, 'create');
        } catch (error) {
            toast.error('Internal Server Error');
        } finally {
            setIsLoading(false);
        }
    };

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
        <>
            <div className="flex flex-col w-full flex-1">
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

                <div className="overflow-auto no-scrollbar" style={{ maxHeight: '50vh'}}>
                    <AnimatePresence>
                        {vertexFormValues.properties.map((property, index) => (
                        <motion.div
                            key={property.id}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center content-around w-full"
                        >
                            <div className="flex items-center content-around w-full">
                                <Input
                                    isRequired
                                    size="md"
                                    type="text"
                                    label="Key"
                                    variant="bordered"
                                    isInvalid={property.errorMessage !== ''}
                                    errorMessage={property.errorMessage}
                                    value={property.key}
                                    onChange={(e) => handlePropertyChange(index, 'key', e.target.value)}
                                    className="bg-gray-100 dark:bg-gray-700 rounded-xl mt-2 mr-2 flex-1"
                                />
                                <Select 
                                    isRequired
                                    size="md"
                                    className="dark:dark mt-2 flex-1 mr-2"
                                    label="Datatype"
                                    selectedKeys={[property.datatype]}
                                    onChange={(e) => handlePropertyChange(index, 'datatype', e.target.value)}
                                >
                                    <SelectItem className="dark:dark text-black" key="String" value="String">String</SelectItem>
                                    <SelectItem className="dark:dark text-black" key="Int" value="Int">Int</SelectItem>
                                    <SelectItem className="dark:dark text-black" key="Float" value="Float">Float</SelectItem>
                                    <SelectItem className="dark:dark text-black" key="Boolean" value="Boolean">Boolean</SelectItem>
                                </Select>
                                <Tooltip content={property.required ? 'Required' : 'Optional'} className="dark:dark">
                                    <div className="mt-3">
                                        <Switch defaultChecked className="dark" size='lg' isSelected={property.required} onChange={(event) => handlePropertyChange(index, 'required', event.target.checked)}/>
                                    </div>
                                </Tooltip>
                                <Button isIconOnly color="danger" className="p-2 mt-2 mr-2" size="lg" onClick={() => handleDeleteProperty(index)}>
                                    <DeleteIcon />
                                </Button>   
                            </div>
                        </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
            
            <div className="flex w-full">
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
        </>
    );
}