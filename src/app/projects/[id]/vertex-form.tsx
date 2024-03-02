import { ChangeEvent, useEffect, useState } from 'react';
import { Button, Input, Slider, Switch, Tooltip, Select, SelectItem } from "@nextui-org/react";
import { motion, AnimatePresence } from 'framer-motion'
import { Property } from "@/models/property-model";
import { v4 as uuidv4 } from 'uuid';
import { DeleteIcon } from "./delete-icon";
import { addVertex, deleteVertex, updateVertex } from '@/services/vertex-service';
import { HttpResponseType } from '@/models/http/http-response-type';
import { VertexHttpResponse } from '@/models/http/vertex-http-response';
import { VertexResponse } from '@/models/response/vertex-response-model';
import { toast } from 'react-hot-toast';


interface VertexFormValues {
    name: string;
    radius: number;
    properties: any[];
}

export default function VertexForm({ projectId, graphCenter, selectedVertex, handleCreateVertex, handleUpdateVertex, handleDeleteVertex }: any) {
    const [vertexFormValues, setVertexFormValues] = useState<VertexFormValues>({
        name: '',
        radius: 30,
        properties: [],
    });

    const [isCreateLoading, setIsCreateLoading] = useState<boolean>(false);
    const [isUpdateLoading, setIsUpdateLoading] = useState<boolean>(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false);
    
    const [isNameInvalid, setIsNameInvalid] = useState<boolean>();
    const [nameErrorMessage, setNameErrorMessage] = useState<string>();
    const [generalErrorMessage, setGeneralErrorMessage] = useState<string | null>();

    // Initial Load of the Input Fields
    useEffect(() => {
        if (selectedVertex) {
            setVertexFormValues({
                name: selectedVertex.name || '',
                radius: selectedVertex.radius || 30,
                properties: selectedVertex.properties.map((property: any) => ({
                    id: property.id,
                    key: property.key,
                    required: property.required,
                    datatype: property.datatype,
                    isInvalid: false,
                    errorMessage: ""
                })) || [],
            });
        } else {
            setVertexFormValues({
                name: '',
                radius: 30,
                properties: [],
            });
        }
        setIsNameInvalid(false)
        setNameErrorMessage("")
    }, [selectedVertex]);

    // Button Click Handlers
    const handleCreateVertexSubmit = async () => {
        setIsCreateLoading(true)
        const res = await addVertex(
            projectId, 
            vertexFormValues.name, 
            vertexFormValues.radius, 
            vertexFormValues.properties.map(property => ({
                key: property.key,
                required: property.required,
                datatype: property.datatype
            })),
            graphCenter.x,
            graphCenter.y
        )
        evaluateHttpResponse(res, "Successfully added new Vertex", handleCreateVertex);
        setIsCreateLoading(false);
    };

    const handleUpdateVertexSubmit = async () => {
        setIsUpdateLoading(true)
        const res = await updateVertex(
            projectId,
            selectedVertex.id,
            vertexFormValues.name,
            vertexFormValues.radius,
            vertexFormValues.properties,
            selectedVertex.position_x,
            selectedVertex.position_y
        )
        evaluateHttpResponse(res, "Successfully updated Vertex", handleUpdateVertex);
        setIsUpdateLoading(false)
    }

    const handleDeleteVertexSubmit = async () => {
        setIsDeleteLoading(true)
        await deleteVertex(projectId, selectedVertex.id);
        handleDeleteVertex(selectedVertex.id)
        setIsDeleteLoading(false)
        toast.success("Successfully deleted Vertex")
    }

    const evaluateHttpResponse = (res: VertexHttpResponse, toastMessage: string, cb: (vertex: VertexResponse) => void) => {
        if (res.type === HttpResponseType.GENERAL_ERROR) {
            setGeneralErrorMessage(res.generalErrorMessage);
        } else if (res.type === HttpResponseType.FIELD_ERROR) {
            setVertexFormValues(prevValues => {
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

    // On Input Value Change Handlers
    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        setIsNameInvalid(false)
        setNameErrorMessage("")
        setGeneralErrorMessage("")

        setVertexFormValues({ ...vertexFormValues, name: e.target.value})
    }

    const handleAddProperty = () => {
        setVertexFormValues((prevValues) => ({
            ...prevValues,
            properties: [...prevValues.properties, {id: uuidv4(), key: '', required: true, datatype: 'String', isInvalid: false, errorMessage: ""}],
        }));
    };

    const handleDeleteProperty = (index: number) => {
        setGeneralErrorMessage("");
        setVertexFormValues((prevValues) => {
            const newProperties = prevValues.properties.filter((_, i) => i !== index);
            return { ...prevValues, properties: newProperties };
        });
    }

    const handlePropertyChange = (index: number, field: keyof Property, value: string | boolean) => {
        setGeneralErrorMessage("");
        setVertexFormValues((prevValues) => {
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
        <>
        <div className="flex flex-col w-full flex-1">
                <Input
                    isRequired
                    type="text"
                    label="Name"
                    variant="bordered"
                    value={vertexFormValues.name}
                    isInvalid={isNameInvalid}
                    errorMessage={nameErrorMessage}
                    onChange={handleNameChange}
                    className="bg-gray-100 dark:bg-gray-700 rounded-xl mt-5"
                />

                <Slider 
                    label="Radius" 
                    step={1} 
                    maxValue={100} 
                    minValue={5} 
                    value={vertexFormValues.radius}
                    onChange={(value) => setVertexFormValues({ ...vertexFormValues, radius: value as number})}
                    className="mt-5"
                    />

                <div className="inline-flex mt-5">
                    <Button color="secondary" variant="ghost" onClick={handleAddProperty}>
                        Add Property
                    </Button>
                </div>

                <div className="overflow-auto no-scrollbar" style={{ maxHeight: '55vh'}}>
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
                { selectedVertex ? 
                <div className="w-full flex">
                    <Button isLoading={isUpdateLoading} isDisabled={isDeleteLoading} color="warning" variant="ghost" onClick={handleUpdateVertexSubmit} className="flex-1 mr-2">
                        Update Vertex
                    </Button>
                    <Button isLoading={isDeleteLoading} isDisabled={isUpdateLoading} color="danger" variant="ghost" onClick={handleDeleteVertexSubmit} className="flex-1">
                        Delete Vertex
                    </Button>
                </div> :
                <Button isLoading={isCreateLoading} color="success" variant="ghost" onClick={handleCreateVertexSubmit} className="flex-1">
                    Create Vertex
                </Button> 
                }
            </div>
        </>
    );
}