import { EdgeResponse } from "../response/edge-response-model";
import { PropertyResponse } from "../response/property-response-model";
import { Property } from "./property";

export class Edge {
    constructor(
        public id: string,
        public label: string,
        public properties: Property[],
        public multiEdge: boolean,
        public source: string,
        public target: string
    ) {}

    public static fromResponse(edge: EdgeResponse): Edge {
        return new Edge(
            edge.id,
            edge.name,
            edge.properties.map((property: PropertyResponse) => Property.fromResponse(property)),
            edge.multi_edge,
            edge.source_vertex_id,
            edge.target_vertex_id
        )
    }
}