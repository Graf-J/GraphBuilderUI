"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardBody, Button, Skeleton, useDisclosure } from "@nextui-org/react";
import MiniGraphBuilder from './mini-graph-builder';
import DeleteModal from '@/app/projects/delete-modal';
import { ProjectResponse } from '@/models/response/project-response-model';
import { getGraph } from '@/services/graph-service';
import toast from 'react-hot-toast';
import { HttpResponseType } from '@/models/http/http-response-type';
import { GraphResponse } from '@/models/response/graph-response-model';
import { Graph } from '@/models/application/graph';


export default function ProjectCard({ project }: { project: ProjectResponse }) {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    const [graph, setGraph] = useState<GraphResponse>();

    useEffect(() => {
        const fetchGraph = async () => {
            try {
                const response = await getGraph(project.id);

                if (response.type === HttpResponseType.GENERAL_ERROR) {
                    toast.error(response.generalErrorMessage);
                } else {
                    setGraph(response.response!);
                }
            } catch {
                toast.error('Internal Server Error');
            }
        }

        fetchGraph()
    }, [project.id])

    return (
        <>
            <div className="w-1/3 h-1/2 p-8">
                <Card className="dark:dark h-full p-2">
                        <CardHeader className="flex justify-between">
                            <h1 className="font-bold text-3xl">{project.name}</h1>
                            <div className="flex flex-row">
                                <Link href={`/projects/${project.id}`}>
                                    <Button color="primary" size="md" className="mr-3">
                                        Edit
                                    </Button>
                                </Link>
                                <Button color="danger" size="md" onPress={onOpen}>
                                    Delete
                                </Button>
                            </div>
                        </CardHeader>
                    <CardBody className="overflow-visible py-2">
                        { !graph ? (
                            <Skeleton className="dark:dark rounded-lg h-full">
                                <div className="h-24 rounded-lg bg-default-300"></div>
                            </Skeleton>
                            ) : (
                                <MiniGraphBuilder graph={Graph.fromResponse(graph)} />
                            )
                        }
                    </CardBody>
                </Card>
            </div>
            <DeleteModal 
                project={project} 
                isOpen={isOpen} 
                onOpenChange={onOpenChange} 
            />
        </>
    );
}