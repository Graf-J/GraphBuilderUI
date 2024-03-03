import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { CollectionReturnValue, Core, SingularElementReturnValue } from 'cytoscape';
import { GraphResponse } from '@/models/response/graph-response-model';
import { parseGraphToElements } from '@/utils/graph-parser';


export default function MiniGraphBuilder({ graph }: { graph: GraphResponse }) {
    const cyRef = useRef<Core | null>(null)

    const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
    
    const applyStyles = useCallback(() => {
        if (cyRef.current) {
            const edges: CollectionReturnValue = cyRef.current.elements('edge');
            edges.forEach((edge: SingularElementReturnValue) => {
                const multiEdge = edge.data('multi_edge');
    
                const edgeStyles = {
                    'target-arrow-shape': multiEdge ? 'triangle-backcurve' : 'diamond',
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
                    'control-point-step-size': 150,
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
      fit: true,
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
        }

        return () => {
            cyRef.current!.removeAllListeners()
        }
    }, [applyStyles, layout])

    const elements = useMemo(() => {
        return parseGraphToElements(graph);
    }, [graph]);

    return (
        <div className="shadow-lg rounded-lg h-full w-full dark:bg-zinc-900 bg-gray-300 dark:bg-dot-white/[0.2] bg-dot-black/[0.2] relative flex items-center justify-center">
            <div className="rounded-lg absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
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