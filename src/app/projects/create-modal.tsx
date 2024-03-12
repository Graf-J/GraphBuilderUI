import { ChangeEvent, useState } from "react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input} from "@nextui-org/react";
import toast from "react-hot-toast";
import { createProject } from "@/services/project-service";
import { HttpResponseType } from "@/models/http/http-response-type";
import { FieldError } from "@/models/http/field-error";
import { useProjectStore } from "@/store/project-store";
import { ProjectRequest } from "@/models/request/project-request-model";
import { Project } from "@/models/application/project";
import { FormProject } from "@/models/form/project-form-model";


export default function CreateModal({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) {
    const [projectFormValues, setProjectFormValues] = useState<FormProject>(FormProject.empty())

    const addProject = useProjectStore((state) => state.add);

    const handleNameChange = async (e: ChangeEvent<HTMLInputElement>) => {
        setProjectFormValues({ name: e.target.value, nameErrorMessage: ''});
    }
    
    const onSubmit = async (onClose: () => void) => {
        try {
            const response = await createProject(ProjectRequest.fromForm(projectFormValues));

            if (response.type === HttpResponseType.FIELD_ERROR) {
                response.fieldErrors?.forEach((fieldError: FieldError) => {
                    if (fieldError.field === 'name') {
                        setProjectFormValues((prevValues: FormProject) => {
                          return { ...prevValues, nameErrorMessage: fieldError.message}
                        });
                    }
                })
            } else if (response.type === HttpResponseType.GENERAL_ERROR) {
                toast.error(response.generalErrorMessage);
            } else {
                toast.success('Successfully created Project');
                addProject(Project.fromResponse(response.response!));
                setProjectFormValues({ name: '', nameErrorMessage: '' });
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
                        value={projectFormValues.name}
                        isInvalid={projectFormValues.nameErrorMessage !== ''}
                        errorMessage={projectFormValues.nameErrorMessage}
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