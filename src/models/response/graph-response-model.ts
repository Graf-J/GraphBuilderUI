import { VertexResponse } from './vertex-response-model';
import { EdgeResponse } from  './edge-response-model';

export interface GraphResponse {
    vertices: VertexResponse[];
    edges: EdgeResponse[];
}