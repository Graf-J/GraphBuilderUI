"use client"

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@nextui-org/react";
import GraphBuilder from '@/components/custom/graph-builder';
import Sidebar from './sidebar';
import { VertexRequest } from '@/models/request/vertex-request-model';
import { EdgeRequest } from '@/models/request/edge-request-model';
import { VertexResponse } from '@/models/response/vertex-response-model';
import { GraphResponse } from '@/models/response/graph-response-model';

export default function Page({ params }: { params: { id: string } }) {
    const [graph, setGraph] = useState<GraphResponse | null>(null);
    const [refresh, setRefresh] = useState<number>(0)
    const [graphCenter, setGraphCenter] = useState<{ x: number, y: number }>()

    const [selectedTab, setSelectedTab] = useState('vertex');
    const [selectedVertex, setSelectedVertex] = useState<VertexRequest | null>(null);
    const [selectedEdge, setSelectedEdge] = useState<EdgeRequest | null>(null);


    useEffect(() => {
        const getGraph = async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/projects/${params.id}/graph`)
            setGraph(await res.json())
        }

        getGraph()
    }, [params.id])

    const handleTabClick = (key: string) => {
        setSelectedTab(key);
    }

    const handleCreateVertex = (vertex: VertexResponse) => {
        if (graph) {
            setGraph((prevGraph) => {
              if (prevGraph) {
                return {
                  ...prevGraph,
                  vertices: [...prevGraph.vertices, vertex],
                };
              }
              return null;
            });
        }
    }

    const handleUpdateVertex = (updatedVertex: VertexResponse) => {
        if (graph) {
            setGraph((prevGraph) => {
                if (prevGraph) {
                    // Find the index of the vertex to be updated
                    const vertexIndex = prevGraph.vertices.findIndex(
                        (vertex) => vertex.id === updatedVertex.id
                    );
    
                    if (vertexIndex !== -1) {
                        if (prevGraph.vertices[vertexIndex].radius !== updatedVertex.radius) {
                            setRefresh(prev => prev + 1);
                        }

                        // Create a new array with the updated vertex
                        const updatedVertices = [...prevGraph.vertices];
                        updatedVertices[vertexIndex] = {
                            ...updatedVertices[vertexIndex],
                            ...updatedVertex,
                        };
    
                        return {
                            ...prevGraph,
                            vertices: updatedVertices,
                        };
                    }
                }
                return null;
            });
        }
    };

    const handleDeleteVertex = (vertexId: string) => {
        if (graph) {
            setGraph((prevGraph) => {
              if (prevGraph) {
                // Remove Vertex from Graph
                const updatedVertices = prevGraph.vertices.filter(
                  (vertex) => vertex.id !== vertexId
                );
        
                // Remove connected Edges from Graph
                const updatedEdges = (prevGraph.edges || []).filter(
                  (edge) => edge.source_vertex_id !== vertexId && edge.target_vertex_id !== vertexId
                );
        
                return {
                  vertices: updatedVertices,
                  edges: updatedEdges,
                };
              }
              return null;
            });
            setSelectedVertex(null);
        }
    }

    const calculateGraphCenter = useCallback(() => {
        if (graph) {
            if (graph.vertices.length === 0) {
                setGraphCenter({ x: 300, y: 300 })
            } else {
                let sumX = 0;
                let sumY = 0;
                graph.vertices.forEach(vertex => {
                    sumX += vertex.position_x;
                    sumY += vertex.position_y
                })
                setGraphCenter({ x: Math.round(sumX / graph.vertices.length), y: Math.round(sumY / graph.vertices.length)})
            }
        }
    }, [graph])

    useEffect(() => {
        calculateGraphCenter();
    }, [calculateGraphCenter, graph]);

    const onVertexSelect = (vertex: VertexRequest) => {
        setSelectedVertex(vertex);
        setSelectedTab('vertex')
    }

    const onEdgeSelect = (edge: EdgeRequest) => {
        setSelectedEdge(edge);
        setSelectedTab('edge')
    }

    const onElementUnselect = () => {
        setSelectedVertex(null);
        setSelectedEdge(null);
    }

  return (
    <div className="p-3 flex h-screen bg-gray-700 dark:bg-gray-500">
        <div
            className="bg-gray-200 dark:bg-gray-800 border-r-2 border-gray-700 dark:border-gray-300 flex rounded-tl-lg rounded-bl-lg"
            style={{ width: 500 }}
        >
            <div className="flex-1 p-2">
                <Sidebar 
                    projectId={params.id}
                    graphCenter={graphCenter}
                    selectedVertex={selectedVertex}
                    selectedEdge={selectedEdge}
                    selectedTab={selectedTab}
                    handleTabClick={handleTabClick}
                    handleCreateVertex={handleCreateVertex}
                    handleUpdateVertex={handleUpdateVertex}
                    handleDeleteVertex={handleDeleteVertex}
                />
            </div>
        </div>
        <div className="flex-1 flex flex-col rounded-tr-lg rounded-br-lg">
            <div className="bg-gray-300 dark:bg-gray-900 rounded-tr-lg p-2 flex justify-end border-b-2 border-gray-800 dark:border-gray-300">
                <Button color="success">Build</Button>  
            </div>
            <div className="shadow-lg h-full w-full dark:bg-black bg-white dark:bg-dot-white/[0.2] bg-dot-black/[0.2] relative flex items-center justify-center rounded-br-lg">
            <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] rounded-br-lg"></div>
                { graph && 
                    <GraphBuilder 
                        projectId={params.id}
                        graph={graph} 
                        eventHandlers={{
                            onVertexSelect,
                            onEdgeSelect,
                            onElementUnselect,
                            handleUpdateVertex
                        }}
                        refresh={refresh}
                    /> 
                }
            </div>
        </div>
    </div>
  );
}