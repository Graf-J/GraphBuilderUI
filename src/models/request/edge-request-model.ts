import { PropertyResponse } from '../response/property-response-model';

export interface EdgeRequest {
    id: string;
    name: string;
    properties: PropertyResponse[];
    multi_edge: boolean;
    source_vertex_id: string;
    target_vertex_id: string;
}