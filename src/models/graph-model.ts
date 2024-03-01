import { Vertex } from './vertex-model';
import { Edge } from  './edge-model';

export interface Graph {
    vertices: Vertex[];
    edges: Edge[];
}