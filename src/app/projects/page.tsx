"use client"
import { useEffect } from 'react';
import { Button, useDisclosure, Spinner } from "@nextui-org/react";
import ProjectCard from '@/components/custom/project-card';
import { HttpResponseType } from '@/models/http/http-response-type';
import { ProjectResponse } from '@/models/response/project-response-model';
import { getProjects } from '@/services/project-service';
import { Project } from '@/models/application/project';
import { AddIcon } from "./add-icon";
import toast from 'react-hot-toast';
import CreateModal from "./create-modal";
import { useProjectStore } from '@/store/project-store';


export default function Page() {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    const { projects, set: setProjects } = useProjectStore();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await getProjects();
        
                if (response.type === HttpResponseType.GENERAL_ERROR) {
                    toast.error(response.generalErrorMessage)
                } else {
                    const projects = response.response!.map((projectResponse: ProjectResponse) => Project.fromResponse(projectResponse))
                    setProjects(projects);
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
                {projects ? (
                    projects.length === 0 ? (
                        <div className="flex h-screen w-screen justify-center items-center">
                            <p className="text-6xl text-slate-500">No projects available</p>
                        </div>
                    ) : (
                        projects.map((project: ProjectResponse) => (
                            <ProjectCard key={project.id} project={project} />
                        ))
                    )
                ) : (
                    <div className="flex h-screen w-screen justify-center items-center">
                        <Spinner size="lg" />
                    </div>
                )}
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