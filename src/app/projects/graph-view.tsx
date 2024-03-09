import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { CollectionReturnValue, Core, ElementDefinition, SingularElementReturnValue } from 'cytoscape';
import { Vertex } from '@/models/application/vertex';
import { Edge } from '@/models/application/edge';
import { Graph } from '@/models/application/graph';


export default function GraphView({ graph }: { graph: Graph }) {
    const cyRef = useRef<Core | null>(null)

    const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
    
    const applyStyles = useCallback(() => {
        if (cyRef.current) {
            const edges: CollectionReturnValue = cyRef.current.elements('edge');
            edges.forEach((edge: SingularElementReturnValue) => {
                const multiEdge = edge.data('multi_edge');
    
                const edgeStyles = {
                    'target-arrow-shape': multiEdge ? 'diamond' : 'triangle-backcurve',
                };
  
                edge.style(edgeStyles)
            });
    
            const stylesheet = [
                {
                    selector: 'node',
                    style: {
                        'label': 'data(label)',
                        'color': isDarkMode ? 'white' : 'black',
                        'text-background-color': isDarkMode ? '#111' : '#ddd',
                        'text-background-opacity': 0.85,
                        'background-color': '#7358FF',
                        'border-width': 2,
                        'border-color': isDarkMode ? 'white' : 'black',
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
                    'text-background-color': isDarkMode ? '#111' : '#ddd',
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
    }), []);

    useEffect(() => {
        if (cyRef.current) {
            // Listen to Dark-Mode Browser Setting
            const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDarkMode(prefersDarkMode);
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event: MediaQueryListEvent) => setIsDarkMode(event.matches));
            
            // Render Graph
            cyRef.current.on('layoutready', () => {
                cyRef.current!.layout(layout).run();
            });
            cyRef.current.ready(() => {
                applyStyles()
            });
            cyRef.current.center();
            cyRef.current.fit();
        }

        return () => {
            cyRef.current!.removeAllListeners()
        }
    }, [applyStyles, layout])

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
        <div className="shadow-lg rounded-lg h-full w-full dark:bg-zinc-900 bg-gray-300 dark:bg-dot-white/[0.2] bg-dot-black/[0.2] relative flex items-center justify-center">
            <CytoscapeComponent
                className="h-full w-full"
                wheelSensitivity={0.3}
                elements={elements}
                layout={layout}
                cy={(cy: Core) => cyRef.current = cy}
            />
        </div>
    )
}