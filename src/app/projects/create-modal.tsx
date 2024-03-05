import { ChangeEvent, useState } from "react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input} from "@nextui-org/react";
import toast from "react-hot-toast";
import { createProject } from "@/services/project-service";
import { HttpResponseType } from "@/models/http/http-response-type";
import { FieldError } from "@/models/http/field-error";
import { useProjectStore } from "@/store/project-store";


export default function CreateModal({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) {
    const [name, setName] = useState<string>('');
    const [nameErrorMessage, setNameErrorMessage] = useState<string>('');

    const addProject = useProjectStore((state) => state.add);

    const handleNameChange = async (e: ChangeEvent<HTMLInputElement>) => {
        setNameErrorMessage('');
        setName(e.target.value);
    }
    
    const onSubmit = async (onClose: () => void) => {
        try {
            const response = await createProject(name);

            if (response.type === HttpResponseType.FIELD_ERROR) {
                response.fieldErrors?.forEach((fieldError: FieldError) => {
                    if (fieldError.field === 'name') {
                        setNameErrorMessage(fieldError.message);
                    }
                })
            } else if (response.type === HttpResponseType.GENERAL_ERROR) {
                toast.error(response.generalErrorMessage);
            } else {
                toast.success('Successfully created Project');
                addProject(response.response!);
                onClose();
            }
        } catch {
            toast.error('Internal Server Error');
        }
    }
    
    
    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" className="dark:dark">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Create Project</ModalHeader>
              <ModalBody>
                <Input
                        isRequired
                        type="text"
                        label="Name"
                        variant="bordered"
                        value={name}
                        isInvalid={nameErrorMessage !== ''}
                        errorMessage={nameErrorMessage}
                        onChange={handleNameChange}
                        className="bg-gray-100 dark:bg-gray-700 rounded-xl mt-5"
                    />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={() => onSubmit(onClose)}>
                  Create
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    )
}