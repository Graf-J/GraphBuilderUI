"use client"
import { useEffect } from 'react';
import { Spinner, Skeleton } from '@nextui-org/react';
import GraphBuilder from '@/components/custom/graph-builder';
import Sidebar from './sidebar';
import Toolbar from './toolbar';
import { getGraph } from '@/services/graph-service';
import { HttpResponseType } from '@/models/http/http-response-type';
import toast from 'react-hot-toast';
import { useGraphStore } from '@/store/graph-store';
import { Graph } from '@/models/application/graph';

export default function Page({ params }: { params: { id: string } }) {
    const { graph, setGraph } = useGraphStore()

    useEffect(() => {
        const fetchGraph = async () => {
            try {
                const response = await getGraph(params.id)
    
                if (response.type === HttpResponseType.GENERAL_ERROR) {
                    toast.error(response.generalErrorMessage);
                } else {
                    setGraph(Graph.fromResponse(response.response!));
                }
            } catch {
                toast.error('Internal Server Error');
            }
        }

        fetchGraph();
    }, [params.id, setGraph])

  return (
    <div className="p-3 flex h-screen bg-gray-700 dark:bg-gray-500 overflow-hidden">
        <div className="bg-gray-200 dark:bg-gray-800 border-r-2 border-gray-700 dark:border-gray-300 flex rounded-tl-lg rounded-bl-lg" style={{ width: 500 }}>
            <div className="flex-1 p-2">
                { graph ? 
                    <div className="h-full">
                        <Sidebar projectId={params.id} /> 
                    </div>
                : 
                    <div className="h-full flex items-center justify-center">
                        <Spinner size="lg" />
                    </div> 
                }
            </div>
        </div>
        <div className="flex-1 flex flex-col rounded-tr-lg rounded-br-lg">
            <Toolbar projectId={params.id} />
            <div className="shadow-lg h-full w-full dark:bg-black bg-white dark:bg-dot-white/[0.2] bg-dot-black/[0.2] relative flex items-center justify-center rounded-br-lg">
                { graph ? 
                    <GraphBuilder projectId={params.id} /> 
                :
                    <Skeleton className="dark:dark rounded-lg h-full w-full" />
                }
            </div>
        </div>
    </div>
  );
}