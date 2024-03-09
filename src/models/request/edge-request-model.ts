import { FormEdge } from "../form/edge-form-model";
import { FormProperty } from "../form/property-form-model";
import { PropertyRequest } from "./property-request-model";

export class EdgeRequest {
    constructor(
        public name: string,
        public properties: PropertyRequest[],
        public multi_edge: boolean,
        public source_vertex_id: string,
        public target_vertex_id: string
    ) {}

    public static fromForm(formEdge: FormEdge, sourceVertexId: string, targetVertexId: string): EdgeRequest {
        return new EdgeRequest(
            formEdge.name,
            formEdge.properties.map((property: FormProperty) => PropertyRequest.fromForm(property)),
            formEdge.multiEdge,
            sourceVertexId,
            targetVertexId
        )
    }
}