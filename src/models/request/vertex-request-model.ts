import { Property } from '../property-model';

export interface VertexRequest {
    id: string;
    name: string;
    properties: Property[];
    position_x: number;
    position_y: number;
    radius: number;
}