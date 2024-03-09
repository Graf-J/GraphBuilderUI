import { Button, Input, Switch, Tooltip, Select, SelectItem } from "@nextui-org/react";
import { FormProperty } from "@/models/form/property-form-model";
import { AnimatePresence, motion } from 'framer-motion';
import { DeleteIcon } from "./delete-icon";
import { PropertyResponse } from "@/models/response/property-response-model";

export default function PropertyInputList({ properties, handlePropertyChange, handleDeleteProperty }: { 
    properties: FormProperty[],
    handlePropertyChange: (index: number, field: keyof PropertyResponse, value: string | boolean) => void,
    handleDeleteProperty: (index: number) => void
}) {
    return (
        <AnimatePresence>
            {properties.map((property, index) => (
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
    )
}