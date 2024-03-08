import { Edge } from '@/models/application/edge'
import { Graph } from '@/models/application/graph'
import { Vertex } from '@/models/application/vertex'
import { FormEdge } from '@/models/form/edge-form-model'
import { FormVertex } from '@/models/form/vertex-form-model'
import { create } from 'zustand'

interface GraphState {
    selectedVertex: FormVertex | null
    selectedEdge: FormEdge | null
    graph: Graph | undefined
    centerGraphState: boolean

    setSelectedVertex: (vertex: FormVertex) => void
    resetSelectedVertex: () => void

    setSelectedEdge: (edge: FormEdge) => void
    resetSelectedEdge: () => void

    setGraph: (graph: Graph) => void

    addVertex: (vertex: Vertex) => void
    updateVertex: (vertex: Vertex) => void
    deleteVertex: (vertexId: string) => void

    addEdge: (edge: Edge) => void
    updateEdge: (edge: Edge) => void
    deleteEdge: (edgeId: string) => void

    centerGraph: () => void
}

export const useGraphStore = create<GraphState>((set) => ({
    graph: undefined,
    selectedVertex: null,
    selectedEdge: null,
    centerGraphState: false,

    setSelectedVertex: (vertex: FormVertex) => set((state) => ({ selectedVertex: vertex })),
    resetSelectedVertex: () => set((state) => ({ selectedVertex: null })),

    setSelectedEdge: (edge: FormEdge) => set((state) => ({ selectedEdge: edge })),
    resetSelectedEdge: () => set((state) => ({ selectedEdge: null })),

    setGraph: (graph: Graph) => set((state) => ({ graph: graph })),

    addVertex: (vertex: Vertex) => set((state) => {
        if (!state.graph) {
            console.error('Graph not initialized');
            return state;
        }

        const newGraph: Graph = {
            ...state.graph!,
            vertices: [...state.graph!.vertices, vertex]
        }

        return { graph: newGraph }
    }),
    updateVertex: (updatedVertex: Vertex) => set((state) => {
        if (!state.graph) {
            console.error('Graph not initialized');
            return state;
        }

        const vertexIndex = state.graph.vertices.findIndex((vertex: Vertex) => vertex.id === updatedVertex.id)

        if (vertexIndex === -1) {
            console.error('Vertex not found.');
            return state;
        }

        const newGraph: Graph = {
            ...state.graph,
            vertices: [
                ...state.graph.vertices.slice(0, vertexIndex),
                updatedVertex,
                ...state.graph.vertices.slice(vertexIndex + 1)
            ]
        }

        return { graph: newGraph }
    }),
    deleteVertex: (vertexId: string) => set((state) => {
        if (!state.graph) {
            console.error('Graph not initialized');
            return state;
        }

        const newVertices = state.graph.vertices.filter((vertex: Vertex) => vertex.id !== vertexId);
        const newEdges = state.graph.edges.filter((edge: Edge) => edge.source !== vertexId && edge.target !== vertexId)

        const newGraph: Graph = {
            vertices: newVertices,
            edges: newEdges
        }

        return { graph: newGraph };
    }),

    addEdge: (edge: Edge) => set((state) => {
        if (!state.graph) {
            console.error('Graph not initialized');
            return state;
        }

        const newGraph: Graph = {
            ...state.graph!,
            edges: [...state.graph!.edges, edge]
        }

        return { graph: newGraph }
    }),
    updateEdge: (updatedEdge: Edge) => set((state) => {
        if (!state.graph) {
            console.error('Graph not initialized');
            return state;
        }

        const edgeIndex = state.graph.edges.findIndex((edge: Edge) => edge.id === updatedEdge.id)

        if (edgeIndex === -1) {
            console.error('Edge not found.');
            return state;
        }

        const newGraph: Graph = {
            ...state.graph,
            edges: [
                ...state.graph.edges.slice(0, edgeIndex),
                updatedEdge,
                ...state.graph.edges.slice(edgeIndex + 1)
            ]
        }

        return { graph: newGraph }
    }),
    deleteEdge: (edgeId: string) => set((state) => {
        if (!state.graph) {
            console.error('Graph not initialized');
            return state;
        }

        const newEdges = state.graph.edges.filter((edge: Edge) => edge.id !== edgeId);

        const newGraph: Graph = {
            ...state.graph,
            edges: newEdges
        }

        return { graph: newGraph };
    }),

    centerGraph: () => set((state) => ({ centerGraphState: !state.centerGraphState }))
}));