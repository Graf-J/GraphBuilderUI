"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardBody, Button, Skeleton } from "@nextui-org/react";
import MiniGraphBuilder from './mini-graph-builder';


export default function ProjectCard({ project }: any) {
    const [graph, setGraph] = useState(null);

    useEffect(() => {
        const getGraph = async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/projects/${project.id}/graph`)
            setGraph(await res.json())
        }

        getGraph()
    }, [project.id])

    return (
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
                            <Button color="danger" size="md">
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
                            <MiniGraphBuilder graph={graph} />
                        )
                    }
                </CardBody>
            </Card>
        </div>
    );
}