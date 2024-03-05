import { useState } from 'react';
import { ProjectResponse } from "@/models/response/project-response-model";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Checkbox} from "@nextui-org/react";
import { deleteProject } from '@/services/project-service';
import toast from 'react-hot-toast';
import { HttpResponseType } from '@/models/http/http-response-type';
import { useProjectStore } from '@/store/project-store';

export default function DeleteModal({ project, isOpen, onOpenChange }: { project: ProjectResponse, isOpen: boolean, onOpenChange: (open: boolean) => void}) {
  const [isDeleteProjectOutputChecked, setIsDeleteProjectOutputChecked] = useState<boolean>(false);

  const removeProject = useProjectStore((state) => state.delete);

  const onSubmit = async (onClose: () => void) => {
    try {
        const response = await deleteProject(project.id, isDeleteProjectOutputChecked);

        if (response.type === HttpResponseType.GENERAL_ERROR) {
            toast.error(response.generalErrorMessage);
        } else {
            toast.success('Successfully deleted Project');
            removeProject(project.id);
            onClose();
        }
    } catch {
        toast.error('Interal Server Error');
    }
  }

  return (
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" className="dark:dark">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Delete Project</ModalHeader>
              <ModalBody>
                Are you sure you want to delete your Project &quot;{ project.name }&quot;?
                <Checkbox
                    isSelected={isDeleteProjectOutputChecked}
                    onChange={(e) => setIsDeleteProjectOutputChecked(e.target.checked)}
                >
                    Delete Project Output Folder
                </Checkbox>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="danger" onPress={() => onSubmit(onClose)}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
  );
}
