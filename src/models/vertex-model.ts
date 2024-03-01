import { Property } from './property-model';
import { Edge } from './edge-model';

export interface Vertex {
    id: string;
    name: string;
    properties: Property[];
    out_edges: Edge[];
    in_edges: Edge[];
    position_x: number;
    position_y: number;
    radius: number;
}