import { useState, useEffect, ChangeEvent } from 'react';
import { Button, Input, Switch, Tooltip, Select, SelectItem, Checkbox } from "@nextui-org/react";
import { VertexResponse } from '@/models/response/vertex-response-model';
import { AnimatePresence, motion } from 'framer-motion';
import { DeleteIcon } from './delete-icon';
import { Property } from '@/models/property-model';
import { v4 as uuidv4 } from 'uuid';
import { addEdge, deleteEdge, updateEdge } from '@/services/edge-service';
import { HttpResponse } from '@/models/http/http-response';
import { EdgeResponse } from '@/models/response/edge-response-model';
import { HttpResponseType } from '@/models/http/http-response-type';
import { toast } from 'react-hot-toast';


interface EdgeFormValues {
    name: string;
    multiEdge: boolean;
    sourceVertexName: string | null;
    targetVertexName: string | null;
    properties: any[];
}

export default function EdgeForm({ projectId, vertices, selectedEdge, handleCreateEdge, handleUpdateEdge, handleDeleteEdge }: any) {
    const [edgeFormValues, setEdgeFormValues] = useState<EdgeFormValues>({
        name: '',
        multiEdge: true,
        sourceVertexName: '',
        targetVertexName: '',
        properties: []
    })

    const [isCreateLoading, setIsCreateLoading] = useState<boolean>(false);
    const [isUpdateLoading, setIsUpdateLoading] = useState<boolean>(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false); 
    
    const [isNameInvalid, setIsNameInvalid] = useState<boolean>();
    const [nameErrorMessage, setNameErrorMessage] = useState<string>();
    const [isSourceVertexInvalid, setIsSourceVertexInvalid] = useState<boolean>();
    const [sourceVertexErrorMessage, setSourceVertexErrorMessage] = useState<string>();
    const [isTargetVertexInvalid, setIsTargetVertexInvalid] = useState<boolean>();
    const [targetVertexErrorMessage, setTargetVertexErrorMessage] = useState<string>();
    const [generalErrorMessage, setGeneralErrorMessage] = useState<string | null>();

    useEffect(() => {
        if (selectedEdge) {
            setEdgeFormValues({
                name: selectedEdge.name,
                multiEdge: selectedEdge.multi_edge,
                sourceVertexName: selectedEdge.source_vertex_name,
                targetVertexName: selectedEdge.target_vertex_name,
                properties: selectedEdge.properties.map((property: any) => ({
                    id: property.id,
                    key: property.key,
                    required: property.required,
                    datatype: property.datatype,
                    isInvalid: false,
                    errorMessage: ""
                })),
            })
        } else {
            setEdgeFormValues({
                name: '',
                multiEdge: true,
                sourceVertexName: '',
                targetVertexName: '',
                properties: []
            })
        }
        setIsNameInvalid(false)
        setNameErrorMessage("")
    }, [selectedEdge])

    // Button Click Handlers
    const handleCreateEdgeSubmit = async () => {
        try {
            setIsCreateLoading(true)
            const sourceVertex = vertices.find((vertex: any) => vertex.name === edgeFormValues.sourceVertexName)
            if (!sourceVertex) {
                setIsSourceVertexInvalid(true)
                setSourceVertexErrorMessage("Required")
                return
            }
            const targetVertex = vertices.find((vertex: any) => vertex.name === edgeFormValues.targetVertexName)
            if (!targetVertex) {
                setIsTargetVertexInvalid(true)
                setTargetVertexErrorMessage("Required")
                return
            }

            const res = await addEdge(
                projectId,
                edgeFormValues.name,
                edgeFormValues.multiEdge,
                edgeFormValues.properties.map(property => ({
                    key: property.key,
                    required: property.required,
                    datatype: property.datatype
                })),
                sourceVertex.id,
                targetVertex.id,
            );
            evaluateHttpResponse(res, "Successfully added new Edge", handleCreateEdge)
        } catch (error) {
            console.error(error);
        } finally {
            setIsCreateLoading(false)
        }
    }

    const handleUpdateEdgeSubmit = async () => {
        try {
            setIsUpdateLoading(true)
            const sourceVertex = vertices.find((vertex: any) => vertex.name === edgeFormValues.sourceVertexName)
            if (!sourceVertex) {
                setIsSourceVertexInvalid(true)
                setSourceVertexErrorMessage("Required")
                return
            }
            const targetVertex = vertices.find((vertex: any) => vertex.name === edgeFormValues.targetVertexName)
            if (!targetVertex) {
                setIsTargetVertexInvalid(true)
                setTargetVertexErrorMessage("Required")
                return
            }

            const res = await updateEdge(
                projectId,
                selectedEdge.id,
                edgeFormValues.name,
                edgeFormValues.multiEdge,
                edgeFormValues.properties.map(property => ({
                    key: property.key,
                    required: property.required,
                    datatype: property.datatype
                })),
                sourceVertex.id,
                targetVertex.id,
            )
            evaluateHttpResponse(res, "Successfully updated Edge", handleUpdateEdge)
        } catch (error) {
            console.error(error)
        } finally {
            setIsUpdateLoading(false)
        }
    }

    const evaluateHttpResponse = (res: HttpResponse<EdgeResponse>, toastMessage: string, cb: (vertex: EdgeResponse) => void) => {
        if (res.type === HttpResponseType.GENERAL_ERROR) {
            setGeneralErrorMessage(res.generalErrorMessage);
        } else if (res.type === HttpResponseType.FIELD_ERROR) {
            setEdgeFormValues(prevValues => {
                const newProperties = [...prevValues.properties];
                res.fieldErrors?.forEach(fieldError => {
                    if (fieldError.field === 'properties') {
                        newProperties[fieldError.index!] = {
                            ...newProperties[fieldError.index!],
                            isInvalid: true,
                            errorMessage: fieldError.message,
                        };
                    } else if (fieldError.field === 'name') {
                        setIsNameInvalid(true)
                        setNameErrorMessage(fieldError.message)
                    }
                });
    
                return { ...prevValues, properties: newProperties };
            });
        } else {
            cb(res.response!);
            toast.success(toastMessage)
        }
    }

    const handleDeleteEdgeSubmit = async () => {
        try {
            setIsDeleteLoading(true)

            await deleteEdge(projectId, selectedEdge.id)
            handleDeleteEdge(selectedEdge.id)

            toast.success("Successfully deleted Edge")
        } catch (error) {
            console.error(error)
        } finally {
            setIsDeleteLoading(false)
        }
    }

    // On Input Value Change Handlers
    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        setIsNameInvalid(false)
        setNameErrorMessage("")
        setGeneralErrorMessage("")

        setEdgeFormValues({ ...edgeFormValues, name: e.target.value})
    }

    const handleMultiEdgeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEdgeFormValues({ ...edgeFormValues, multiEdge: e.target.checked })
    }

    const handleSourceChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setIsSourceVertexInvalid(false)
        setSourceVertexErrorMessage("")
        setEdgeFormValues({ ...edgeFormValues, sourceVertexName: e.target.value })
    }

    const handleTargetChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setIsTargetVertexInvalid(false)
        setTargetVertexErrorMessage("")
        setEdgeFormValues({ ...edgeFormValues, targetVertexName: e.target.value })
    }

    const handleAddProperty = () => {
        setEdgeFormValues((prevValues) => ({
            ...prevValues,
            properties: [...prevValues.properties, {id: uuidv4(), key: '', required: true, datatype: 'String', isInvalid: false, errorMessage: ""}],
        }));
    };

    const handleDeleteProperty = (index: number) => {
        setGeneralErrorMessage("");
        setEdgeFormValues((prevValues) => {
            const newProperties = prevValues.properties.filter((_, i) => i !== index);
            return { ...prevValues, properties: newProperties };
        });
    }

    const handlePropertyChange = (index: number, field: keyof Property, value: string | boolean) => {
        setGeneralErrorMessage("");
        setEdgeFormValues((prevValues) => {
            const newProperties = [...prevValues.properties];
            let updatedProperty;
            if (field === 'datatype') {
                updatedProperty = { ...newProperties[index], [field]: value === "" ? 'String' : value, isInvalid: false, errorMessage: "" };
            } else {
                updatedProperty = { ...newProperties[index], [field]: value, isInvalid: false, errorMessage: "" };
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
                    isInvalid={isNameInvalid}
                    errorMessage={nameErrorMessage}
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
                        isInvalid={isSourceVertexInvalid}
                        errorMessage={sourceVertexErrorMessage}
                        selectedKeys={edgeFormValues.sourceVertexName ? [edgeFormValues.sourceVertexName] : []}
                        onChange={handleSourceChange}
                    >
                        {vertices.map((vertex: VertexResponse) => (
                            <SelectItem key={vertex.name} value={vertex.name} className="dark:dark text-black">
                                {vertex.name}
                            </SelectItem>
                        ))}
                    </Select>

                    <Select 
                        isRequired
                        size="md"
                        className="dark:dark"
                        label="Target"
                        isInvalid={isTargetVertexInvalid}
                        errorMessage={targetVertexErrorMessage}
                        selectedKeys={edgeFormValues.targetVertexName ? [edgeFormValues.targetVertexName] : []}
                        onChange={handleTargetChange}
                    >
                        {vertices.map((vertex: VertexResponse) => (
                            <SelectItem key={vertex.name} value={vertex.id} className="dark:dark text-black">
                                {vertex.name}
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
                                    isInvalid={property.isInvalid}
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

            <p className="text-red-500 mb-4 text-center">{generalErrorMessage}</p>
                        
            <div className="flex w-full">
                { selectedEdge ? 
                <div className="w-full flex">
                    <Button isLoading={isUpdateLoading} isDisabled={isDeleteLoading} color="warning" variant="ghost" onClick={handleUpdateEdgeSubmit} className="flex-1 mr-2">
                        Update Edge
                    </Button>
                    <Button isLoading={isDeleteLoading} isDisabled={isUpdateLoading} color="danger" variant="ghost" onClick={handleDeleteEdgeSubmit} className="flex-1">
                        Delete Edge
                    </Button>
                </div> :
                <Button isLoading={isCreateLoading} color="success" variant="ghost" onClick={handleCreateEdgeSubmit} className="flex-1">
                    Create Edge
                </Button> 
                }
            </div>
        </div>
    );
}