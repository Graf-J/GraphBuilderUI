"use client"
import { useEffect, useState } from 'react';
import { Button, useDisclosure } from "@nextui-org/react";
import ProjectCard from '@/components/custom/project-card';
import { HttpResponseType } from '@/models/http/http-response-type';
import { ProjectResponse } from '@/models/response/project-response-model';
import { getProjects } from '@/services/project-service';
import { AddIcon } from "./add-icon";
import toast from 'react-hot-toast';
import CreateModal from "./create-modal";
import { useProjectStore } from '@/store/project-store';


export default function Page() {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    // const [projects, setProjects] = useState<ProjectResponse[]>();
    const { projects, set: setProjects } = useProjectStore()

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await getProjects();
        
                if (response.type === HttpResponseType.GENERAL_ERROR) {
                    toast.error(response.generalErrorMessage)
                } else {
                    setProjects(response.response!);
                }
            } catch {
                toast.error('Internal Server Error')
            }
        }

        fetchProjects()
    }, [setProjects])


    return(
        <>
            <div className="flex flex-wrap h-screen bg-gray-200 dark:bg-gray-800 overflow-auto">
                { projects && projects.map((project: ProjectResponse) => (
                    <ProjectCard key={project.id}  project={project}/>
                ))}
                <div className="fixed bottom-4 right-4 h-24 w-24">
                    <Button isIconOnly color="primary" radius="full" className="w-full h-full p-2" onPress={onOpen}>
                        <AddIcon />
                    </Button> 
                </div>
            </div>
            <CreateModal isOpen={isOpen} onOpenChange={onOpenChange} />
        </>
    );
}