import { Property } from '../property-model';

export interface EdgeResponse {
    id: string;
    name: string;
    properties: Property[];
    multi_edge: boolean;
    source_vertex_id: string;
    target_vertex_id: string;
}