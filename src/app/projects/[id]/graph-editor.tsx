import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { CollectionReturnValue, Core, EventObject, SingularElementReturnValue, ElementDefinition } from 'cytoscape';
import { updateVertex } from '@/services/vertex-service';
import { useGraphStore } from '@/store/graph-store';
import { Vertex } from '@/models/application/vertex';
import { Edge } from '@/models/application/edge';
import { FormVertex } from '@/models/form/vertex-form-model';
import { FormEdge } from '@/models/form/edge-form-model';
import { HttpResponseType } from '@/models/http/http-response-type';
import { VertexRequest } from '@/models/request/vertex-request-model';
import { Property } from '@/models/application/property';
import { PropertyRequest } from '@/models/request/property-request-model';


export default function GraphEditor({ projectId }: { projectId: string }) {
    const cyRef = useRef<Core | null>(null)

    const { 
        graph,
        centerGraphState,
        updateVertex: updateVertexInStore,
        setSelectedVertex, 
        setSelectedEdge, 
        resetSelectedVertex, 
        resetSelectedEdge 
    } = useGraphStore()

    const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
    
    const applyStyles = useCallback(() => {
        if (cyRef.current) {
            const edges: CollectionReturnValue = cyRef.current.elements('edge');
            edges.forEach((edge: SingularElementReturnValue) => {
                const multiEdge = edge.data('multiEdge');
    
                const edgeStyles = {
                    'target-arrow-shape': multiEdge ? 'diamond' : 'triangle-backcurve',
                };
  
                edge.style(edgeStyles)

                edge.on('select', () => {
                    edge.style({
                        'line-color': isDarkMode ? '#75FA8D' : '#08A045',
                        'target-arrow-color': isDarkMode ? '#75FA8D' : '#08A045',
                        'target-arrow-shape': multiEdge ? 'diamond' : 'triangle-backcurve',
                    });
                })
                edge.on('unselect', () => {
                    edge.style({
                        'line-color': isDarkMode ? 'white' : 'black',
                        'target-arrow-color':  isDarkMode ? 'white' : 'black',
                        'target-arrow-shape': multiEdge ? 'diamond' : 'triangle-backcurve',
                    });
                })
            });
    
            const stylesheet = [
                {
                    selector: 'node',
                    style: {
                        'label': 'data(label)',
                        'color': isDarkMode ? 'white' : 'black',
                        'text-background-color': isDarkMode ? 'black' : 'white',
                        'text-background-opacity': 0.85,
                        'background-color': '#7358FF',
                        'border-width': 3,
                        'border-color': isDarkMode ? 'white' : 'black',
                    },
                },
                {
                    selector: 'node:selected',
                    style: {
                        'color': isDarkMode ? 'white' : 'black',
                        'text-background-color': isDarkMode ? 'black' : 'white',
                        'text-background-opacity': 0.85,
                        'background-color': '#7358FF',
                        'border-width': 3,
                        'border-color': isDarkMode ? '#75FA8D' : '#08A045',
                    },
                },
                {
                  selector: 'edge',
                  style: {
                    'label': 'data(label)',
                    'arrow-scale': 2,
                    'text-background-opacity': 0.85,
                    'curve-style': 'bezier',
                    'control-point-step-size': 100,
                    'color': isDarkMode ? 'white' : 'black',
                    'text-background-color': isDarkMode ? 'black' : 'white',
                    'line-color': isDarkMode ? 'white' : 'black',
                    'target-arrow-color': isDarkMode ? 'white' : 'black',
                  }
                }
            ];
    
            cyRef.current.style(stylesheet);
        }
    }, [isDarkMode]);

    const layout = useMemo(() => ({
      name: 'preset',
      fit: true,
    }), []);

    const handleNodeSelect = useCallback((event: EventObject) => {
        setSelectedVertex(FormVertex.fromVertex(event.target.data()));
        resetSelectedEdge();
    }, [resetSelectedEdge, setSelectedVertex]);

    const handleNodeUnselect = useCallback(() => {
        resetSelectedVertex();
    }, [resetSelectedVertex])
    
    const handleEdgeSelect = useCallback((event: EventObject) => {
        const edge: Edge = event.target.data();
        const sourceVertex = graph!.vertices.find((vertex: Vertex) => vertex.id === edge.source)
        const targetVertex = graph!.vertices.find((vertex: Vertex) => vertex.id === edge.target)

        setSelectedEdge(FormEdge.fromEdge(edge, sourceVertex!.label, targetVertex!.label));
        resetSelectedVertex();
    }, [graph, resetSelectedVertex, setSelectedEdge])

    const handleEdgeUnselect = useCallback(() => {
        resetSelectedEdge()
    }, [resetSelectedEdge])
    
    const handleNodeRelease = useCallback(async (event: EventObject) => {
        const res = await updateVertex(
            projectId,
            event.target.data().id,
            new VertexRequest(
                event.target.data().label,
                Math.round(event.target.position().x),
                Math.round(event.target.position().y),
                event.target.data().properties.map((property: Property) => PropertyRequest.fromProperty(property))
            )
        )

        if (res.type === HttpResponseType.SUCCESS) {
            updateVertexInStore(Vertex.fromResponse(res.response!));
        }
    }, [projectId, updateVertexInStore]);

    useEffect(() => {
        if (cyRef.current) {
            // Listen to Dark-Mode Browser Setting
            const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDarkMode(prefersDarkMode);
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event: MediaQueryListEvent) => setIsDarkMode(event.matches));

            // Handle node selection
            cyRef.current.on('select', 'node', handleNodeSelect);

            // Handl node unselection
            cyRef.current.on('unselect', 'node', handleNodeUnselect);

            // Handle edge selection
            cyRef.current.on('select', 'edge', handleEdgeSelect);

            // Handl node unselection
            cyRef.current.on('unselect', 'edge', handleEdgeUnselect);

            // Handle node release (after dragging)
            cyRef.current.on('dragfree', 'node', handleNodeRelease);
            
            // Render Graph
            cyRef.current.on('layoutready', () => {
                cyRef.current!.layout(layout).run();
            });
            cyRef.current.ready(() => {
                applyStyles()
            });
        }

        return () => {
            cyRef.current!.removeAllListeners()
        }
    }, [applyStyles, handleEdgeSelect, handleEdgeUnselect, handleNodeRelease, handleNodeSelect, handleNodeUnselect, layout])

    useEffect(() => {
        cyRef.current?.center();
        cyRef.current?.fit();
    }, [centerGraphState])

    const elements = useMemo(() => {
        const graphElements: ElementDefinition[] = [];

        graph!.vertices.forEach((vertex: Vertex) => {
            graphElements.push({ 
                data: { ...vertex }, 
                position: { x: vertex.positionX, y: vertex.positionY}, 
                style: { width: 70, height: 70 } 
            });
        })
        graph!.edges.forEach((edge: Edge) => {
            graphElements.push({ data: { ...edge } });
        })

        return graphElements;
    }, [graph]);

    return (
        <CytoscapeComponent
            className="h-full w-full"
            wheelSensitivity={0.3}
            elements={elements}
            layout={layout}
            cy={(cy: Core) => cyRef.current = cy}
        />
    )
}