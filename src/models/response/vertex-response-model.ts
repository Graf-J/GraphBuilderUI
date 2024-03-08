import { PropertyResponse } from './property-response-model';
import { EdgeResponse } from './edge-response-model';

export interface VertexResponse {
    id: string;
    name: string;
    properties: PropertyResponse[];
    out_edges: EdgeResponse[];
    in_edges: EdgeResponse[];
    position_x: number;
    position_y: number;
    radius: number;
}