import { PropertyResponse } from '../response/property-response-model';

export interface VertexRequest {
    id: string;
    name: string;
    properties: PropertyResponse[];
    position_x: number;
    position_y: number;
    radius: number;
}