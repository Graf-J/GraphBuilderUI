import { useState } from "react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, useDisclosure} from "@nextui-org/react";
import { CenterIcon } from "./center-icon";
import { buildProject } from "@/services/build-service"
import { HttpResponse } from "@/models/http/http-response";
import { HttpResponseType } from "@/models/http/http-response-type";
import toast from "react-hot-toast";
import { FieldError } from "@/models/http/field-error";
import { BuildRequest } from "@/models/request/build-request-model";


export default function Toolbar({ projectId, refreshGraph }: any) {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    const [isBuildLoading, setIsBuildLoading] = useState<boolean>(false)

    const [port, setPort] = useState(3000);
    const [volume, setVolume] = useState<string>();

    const [portError, setPortError] = useState<string>('');
    const [volumeError, setVolumeError] = useState<string>('');

    const onBuildClick = async (closeModal: () => void) => {
        try {
            setIsBuildLoading(true)
            const res = await buildProject(projectId, new BuildRequest(port, volume === '' ? undefined : volume))
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
                    setPortError(fieldError.message);
                } else if (fieldError.field === 'volume') {
                    setVolumeError(fieldError.message);
                }
            })
        } else {
            toast.success("Project successfully built");
            closeModal();
        }
    }

    return (
        <div className="bg-gray-300 dark:bg-gray-900 rounded-tr-lg p-2 flex justify-between items-center border-b-2 border-gray-800 dark:border-gray-300">
            <div>
                <Button isIconOnly color="primary" className="p-2 ml-2 mt-1" size="md" onClick={() => refreshGraph()}>
                    <CenterIcon />
                </Button>    
            </div>
            <div>
                <Button color="success" isLoading={isBuildLoading} onPress={onOpen}>Build</Button> 
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
                                defaultValue="3000"
                                variant="bordered"
                                isInvalid={portError !== ''}
                                errorMessage={portError}
                                onChange={(e) => {setPort(Number(e.target.value)); setPortError('')}}
                            />
                            <Input
                                label="Volume"
                                variant="bordered"
                                isInvalid={volumeError !== ''}
                                errorMessage={volumeError}
                                onChange={(e) => {setVolume(e.target.value); setVolumeError('')}}
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