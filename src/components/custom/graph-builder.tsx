import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { CollectionReturnValue, Core, EventObject, SingularElementReturnValue } from 'cytoscape';
import { GraphResponse } from '@/models/response/graph-response-model';
import { parseGraphToElements } from '@/utils/graph-parser';
import { VertexRequest } from '@/models/request/vertex-request-model';
import { EdgeRequest } from '@/models/request/edge-request-model';
import { updateVertex } from '@/services/vertex-service';
import { HttpResponseType } from '@/models/http/http-response-type';


export default function GraphBuilder({ projectId, graph, eventHandlers, refresh }: { projectId: string, graph: GraphResponse, eventHandlers: any, refresh: number }) {
    const cyRef = useRef<Core | null>(null)

    const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
    
    const applyStyles = useCallback(() => {
        if (cyRef.current) {
            const edges: CollectionReturnValue = cyRef.current.elements('edge');
            edges.forEach((edge: SingularElementReturnValue) => {
                const multiEdge = edge.data('multiEdge');
    
                const edgeStyles = {
                    'target-arrow-shape': multiEdge ? 'triangle-backcurve' : 'diamond',
                };
  
                edge.style(edgeStyles)

                edge.on('select', () => {
                    edge.style({
                        'line-color': isDarkMode ? '#75FA8D' : '#08A045',
                        'target-arrow-color': isDarkMode ? '#75FA8D' : '#08A045',
                        'target-arrow-shape': multiEdge ? 'triangle-backcurve' : 'diamond',
                    });
                })
                edge.on('unselect', () => {
                    edge.style({
                        'line-color': isDarkMode ? 'white' : 'black',
                        'target-arrow-color':  isDarkMode ? 'white' : 'black',
                        'target-arrow-shape': multiEdge ? 'triangle-backcurve' : 'diamond',
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
                    'control-point-step-size': 150,
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
        const vertex: VertexRequest = {
            id: event.target.data().id,
            name: event.target.data().label,
            properties: event.target.data().properties,
            radius: event.target.data().radius,
            position_x: Math.round(event.target.position().x),
            position_y: Math.round(event.target.position().y),
        };
        
        eventHandlers.onVertexSelect(vertex);
    }, [eventHandlers]);

    const handleNodeUnselect = useCallback(() => {
        eventHandlers.onElementUnselect();
    }, [eventHandlers])
    
    const handleEdgeSelect = useCallback((event: EventObject) => {
        const edge = {
            id: event.target.data().id,
            name: event.target.data().label,
            multi_edge: event.target.data().multiEdge,
            properties: event.target.data().properties,
            source_vertex_name: event.cy.getElementById(event.target.data().source)[0].data().label,
            target_vertex_name: event.cy.getElementById(event.target.data().target)[0].data().label
        };
    
        eventHandlers.onEdgeSelect(edge);
    }, [eventHandlers])

    const handleEdgeUnselect = useCallback(() => {
        eventHandlers.onElementUnselect()
    }, [eventHandlers])
    
    const handleNodeRelease = useCallback(async (event: EventObject) => {
        const res = await updateVertex(
            projectId,
            event.target.data().id,
            event.target.data().label,
            event.target.data().radius,
            event.target.data().properties,
            Math.round(event.target.position().x),
            Math.round(event.target.position().y)
        )
        if (res.type === HttpResponseType.SUCCESS) {
            eventHandlers.handleUpdateVertex(res.response)
        }
    }, [eventHandlers, projectId]);

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

    const elements = useMemo(() => {
        return parseGraphToElements(graph);
    }, [graph]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    // const keyForCytoscape = useMemo(() => Math.random(), [elements]);

    return (
        <CytoscapeComponent
            key={refresh}
            className="h-full w-full"
            wheelSensitivity={0.3}
            elements={elements}
            layout={layout}
            cy={(cy: Core) => cyRef.current = cy}
        />
    )
}