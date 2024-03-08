import { PropertyResponse } from './property-response-model';

export interface EdgeResponse {
    id: string;
    name: string;
    properties: PropertyResponse[];
    multi_edge: boolean;
    source_vertex_id: string;
    target_vertex_id: string;
}