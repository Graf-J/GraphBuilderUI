import { useState, useEffect, ChangeEvent } from 'react';
import { Button, Input, Switch, Tooltip, Select, SelectItem, Checkbox } from "@nextui-org/react";
import { AnimatePresence, motion } from 'framer-motion';
import { DeleteIcon } from './delete-icon';
import { PropertyResponse } from '@/models/response/property-response-model';
import { addEdge, deleteEdge, updateEdge } from '@/services/edge-service';
import { HttpResponse } from '@/models/http/http-response';
import { EdgeResponse } from '@/models/response/edge-response-model';
import { HttpResponseType } from '@/models/http/http-response-type';
import { toast } from 'react-hot-toast';
import { useGraphStore } from '@/store/graph-store';
import { Edge } from '@/models/application/edge';
import { FormEdge } from '@/models/form/edge-form-model';
import { Vertex } from '@/models/application/vertex';
import { FieldError } from '@/models/http/field-error';
import { FormProperty } from '@/models/form/property-form-model';
import { EdgeRequest } from '@/models/request/edge-request-model';


export default function EdgeForm({ projectId }: any) {
    const [edgeFormValues, setEdgeFormValues] = useState<FormEdge>(FormEdge.empty())

    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    const [isSourceVertexMissing, setIsSourceVertexMissing] = useState<boolean>(false);
    const [isTargetVertexMissing, setIsTargetVertexMissing] = useState<boolean>(false);

    const { 
        graph,
        selectedEdge,
        resetSelectedEdge,
        addEdge: addEdgeToStore, 
        updateEdge: updateEdgeInStore, 
        deleteEdge: deleteEdgeFromStore 
    } = useGraphStore()

    useEffect(() => {
        if (selectedEdge) {
            setEdgeFormValues(selectedEdge);
        } else {
            setEdgeFormValues(FormEdge.empty());
        }
    }, [selectedEdge])

    // Button Click Handlers
    const handleCreateEdgeSubmit = async () => {
        try {
            setIsLoading(true)

            let vertexError: boolean = false;
            const sourceVertex = graph!.vertices.find((vertex: Vertex) => vertex.label === edgeFormValues.sourceVertexName);
            if (!sourceVertex) {
                setIsSourceVertexMissing(true);
                vertexError = true
            }
            const targetVertex = graph!.vertices.find((vertex: Vertex) => vertex.label === edgeFormValues.targetVertexName);
            if (!targetVertex) {
                setIsTargetVertexMissing(true);
                vertexError = true;
            }
            if (vertexError) return;

            const res = await addEdge(projectId, EdgeRequest.fromForm(edgeFormValues, sourceVertex!.id, targetVertex!.id));
            evaluateHttpResponse(res, 'create');
        } catch (error) {
            toast.error('Internal Server Error');
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdateEdgeSubmit = async () => {
        try {
            setIsLoading(true)

            let vertexError: boolean = false;
            const sourceVertex = graph!.vertices.find((vertex: Vertex) => vertex.label === edgeFormValues.sourceVertexName);
            if (!sourceVertex) {
                setIsSourceVertexMissing(true);
                vertexError = true
            }
            const targetVertex = graph!.vertices.find((vertex: Vertex) => vertex.label === edgeFormValues.targetVertexName);
            if (!targetVertex) {
                setIsTargetVertexMissing(true);
                vertexError = true;
            }
            if (vertexError) return;

            const res = await updateEdge(projectId, selectedEdge!.id!, EdgeRequest.fromForm(edgeFormValues, sourceVertex!.id, targetVertex!.id));
            evaluateHttpResponse(res, 'update');
        } catch (error) {
            toast.error('Internal Server Error');
        } finally {
            setIsLoading(false)
        }
    }

    const evaluateHttpResponse = (res: HttpResponse<EdgeResponse>, operation: string) => {
        if (res.type === HttpResponseType.GENERAL_ERROR) {
            toast.error(res.generalErrorMessage);
        } else if (res.type === HttpResponseType.FIELD_ERROR) {
            res.fieldErrors?.forEach((fieldError: FieldError) => {
                if (fieldError.field === 'name') {
                    setEdgeFormValues((prevValues: FormEdge) => {
                        return { ...prevValues, nameErrorMessage: fieldError.message }
                    })
                } else if (fieldError.field === 'properties') {
                    setEdgeFormValues((prevValues: FormEdge) => {
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
                addEdgeToStore(Edge.fromResponse(res.response!));
                toast.success('Successfully created Edge');
                setEdgeFormValues(FormEdge.empty());
            } else if (operation === 'update') {
                updateEdgeInStore(Edge.fromResponse(res.response!));
                toast.success('Successfully updated Edge')
            }
        }
    }

    const handleDeleteEdgeSubmit = async () => {
        try {
            setIsLoading(true)

            await deleteEdge(projectId, selectedEdge!.id!)
            resetSelectedEdge();
            deleteEdgeFromStore(selectedEdge!.id!)
            setIsLoading(false);

            toast.success("Successfully deleted Edge")
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    // On Input Value Change Handlers
    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEdgeFormValues({ ...edgeFormValues, name: e.target.value, nameErrorMessage: '' })
    }

    const handleMultiEdgeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEdgeFormValues({ ...edgeFormValues, multiEdge: e.target.checked })
    }

    const handleSourceChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setIsSourceVertexMissing(false);
        setEdgeFormValues({ ...edgeFormValues, sourceVertexName: e.target.value })
    }

    const handleTargetChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setIsTargetVertexMissing(false);
        setEdgeFormValues({ ...edgeFormValues, targetVertexName: e.target.value })
    }

    const handleAddProperty = () => {
        setEdgeFormValues((prevValues: FormEdge) => {
            return {
                ...prevValues,
                properties: [...prevValues.properties, FormProperty.empty()]
            }
        })
    };

    const handleDeleteProperty = (index: number) => {
        setEdgeFormValues((prevValues) => {
            const newProperties = prevValues.properties.filter((_, i) => i !== index);
            return { ...prevValues, properties: newProperties };
        });
    }

    const handlePropertyChange = (index: number, field: keyof PropertyResponse, value: string | boolean) => {
        setEdgeFormValues((prevValues) => {
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
            <div className="flex flex-col w-full flex-1">
                <Input
                    isRequired
                    type="text"
                    label="Name"
                    variant="bordered"
                    value={edgeFormValues.name}
                    isInvalid={edgeFormValues.nameErrorMessage !== ''}
                    errorMessage={edgeFormValues.nameErrorMessage}
                    onChange={handleNameChange}
                    className="bg-gray-100 dark:bg-gray-700 rounded-xl mt-5"
                />

                <Checkbox 
                    defaultSelected 
                    className="mt-5 ml-1"
                    isSelected={edgeFormValues.multiEdge}
                    onChange={handleMultiEdgeChange}
                >
                    Multi-Edge
                </Checkbox>

                <div className="flex flex-row mt-5">
                    <Select 
                        isRequired
                        size="md"
                        className="dark:dark mr-2"
                        label="Source"
                        isInvalid={isSourceVertexMissing}
                        errorMessage={isSourceVertexMissing ? 'Required' : ''}
                        selectedKeys={edgeFormValues.sourceVertexName ? [edgeFormValues.sourceVertexName] : []}
                        onChange={handleSourceChange}
                    >
                        {graph!.vertices.map((vertex: Vertex) => (
                            <SelectItem key={vertex.label} value={vertex.label} className="dark:dark text-black">
                                {vertex.label}
                            </SelectItem>
                        ))}
                    </Select>

                    <Select 
                        isRequired
                        size="md"
                        className="dark:dark"
                        label="Target"
                        isInvalid={isTargetVertexMissing}
                        errorMessage={isTargetVertexMissing ? 'Required' : ''}
                        selectedKeys={edgeFormValues.targetVertexName ? [edgeFormValues.targetVertexName] : []}
                        onChange={handleTargetChange}
                    >
                        {graph!.vertices.map((vertex: Vertex) => (
                            <SelectItem key={vertex.label} value={vertex.label} className="dark:dark text-black">
                                {vertex.label}
                            </SelectItem>
                        ))}
                    </Select>
                </div>

                <div className="inline-flex mt-5">
                    <Button color="secondary" variant="ghost" onClick={handleAddProperty}>
                        Add Property
                    </Button>
                </div>

                <div className="overflow-auto no-scrollbar" style={{ maxHeight: '40vh'}}>
                    <AnimatePresence>
                        {edgeFormValues.properties.map((property, index) => (
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
                { selectedEdge ? 
                <div className="w-full flex">
                    <Button isDisabled={isLoading} color="warning" variant="ghost" onClick={handleUpdateEdgeSubmit} className="flex-1 mr-2">
                        Update Edge
                    </Button>
                    <Button isDisabled={isLoading} color="danger" variant="ghost" onClick={handleDeleteEdgeSubmit} className="flex-1">
                        Delete Edge
                    </Button>
                </div> :
                <Button isLoading={isLoading} color="success" variant="ghost" onClick={handleCreateEdgeSubmit} className="flex-1">
                    Create Edge
                </Button> 
                }
            </div>
        </div>
    );
}