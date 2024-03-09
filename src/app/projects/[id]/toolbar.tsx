import { ChangeEvent, useState } from "react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, useDisclosure} from "@nextui-org/react";
import { CenterIcon } from "./center-icon";
import { buildProject } from "@/services/build-service"
import { HttpResponse } from "@/models/http/http-response";
import { HttpResponseType } from "@/models/http/http-response-type";
import toast from "react-hot-toast";
import { FieldError } from "@/models/http/field-error";
import { BuildRequest } from "@/models/request/build-request-model";
import { useGraphStore } from "@/store/graph-store";
import { FormBuild } from "@/models/form/build-form-model";


export default function Toolbar({ projectId }: { projectId: string }) {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    const [isBuildLoading, setIsBuildLoading] = useState<boolean>(false)

    const [buildFormValues, setBuildFormValues] = useState<FormBuild>(FormBuild.empty());

    const { graph, centerGraph } = useGraphStore()

    const onBuildClick = async (closeModal: () => void) => {
        try {
            setIsBuildLoading(true)
            const res = await buildProject(projectId, BuildRequest.fromForm(buildFormValues));
            evaluateHttpResponse(res, closeModal)
        } catch (error) {
            toast.error('Internal Server Error')
        } finally {
            setIsBuildLoading(false)
        }
    }

    const evaluateHttpResponse = (res: HttpResponse<void>, closeModal: () => void) => {
        if (res.type === HttpResponseType.GENERAL_ERROR) {
            toast.error(res.generalErrorMessage);
        } else if (res.type === HttpResponseType.FIELD_ERROR) {
            res.fieldErrors?.forEach((fieldError: FieldError) => {
                if (fieldError.field === 'port') {
                    setBuildFormValues((prevValues: FormBuild) => ({ ...prevValues, portErrorMessage: fieldError.message}))
                } else if (fieldError.field === 'volume') {
                    setBuildFormValues((prevValues: FormBuild) => ({ ...prevValues, volumeErrorMessage: fieldError.message}))
                }
            })
        } else {
            toast.success("Project successfully built");
            closeModal();
        }
    }

    const onPortChange = (e: ChangeEvent<HTMLInputElement>) => {
        setBuildFormValues((prevValues: FormBuild) => ({ ...prevValues, port: Number(e.target.value), portErrorMessage: '' }))
    }

    const onVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setBuildFormValues((prevValues: FormBuild) => ({ ...prevValues, volume: e.target.value, volumeErrorMessage: '' }))
    }

    return (
        <div className="bg-gray-300 dark:bg-gray-900 rounded-tr-lg p-2 flex justify-between items-center border-b-2 border-gray-800 dark:border-gray-300">
            <div>
                <Button isIconOnly disabled={!graph} color="primary" className="p-2 ml-2 mt-1" size="md" onClick={() => centerGraph()}>
                    <CenterIcon />
                </Button>    
            </div>
            <div>
                <Button color="success" disabled={!graph} isLoading={isBuildLoading} onPress={onOpen}>Build</Button> 
                <Modal 
                    isOpen={isOpen} 
                    onOpenChange={onOpenChange}
                    placement="top-center"
                    backdrop="blur"
                >
                    <ModalContent className="dark:dark">
                    {(onClose) => (
                        <>
                        <ModalHeader className="flex flex-col gap-1">Build Project</ModalHeader>
                        <ModalBody>
                            <Input
                                isRequired
                                autoFocus
                                label="Port"
                                type="number"
                                value={buildFormValues.port.toString()}
                                variant="bordered"
                                isInvalid={buildFormValues.portErrorMessage !== ''}
                                errorMessage={buildFormValues.portErrorMessage}
                                onChange={onPortChange}
                            />
                            <Input
                                label="Volume"
                                variant="bordered"
                                isInvalid={buildFormValues.volumeErrorMessage !== ''}
                                errorMessage={buildFormValues.volumeErrorMessage}
                                onChange={onVolumeChange}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="flat" onPress={onClose}>Close</Button>
                            <Button color="success" onPress={() => {onBuildClick(onClose)}}>Build</Button>
                        </ModalFooter>
                        </>
                    )}
                    </ModalContent>
                </Modal>
            </div>
        </div>
    );
}