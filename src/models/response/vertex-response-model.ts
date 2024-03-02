import { Property } from '../property-model';
import { EdgeResponse } from './edge-response-model';

export interface VertexResponse {
    id: string;
    name: string;
    properties: Property[];
    out_edges: EdgeResponse[];
    in_edges: EdgeResponse[];
    position_x: number;
    position_y: number;
    radius: number;
}