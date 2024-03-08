import { EdgeResponse } from "../response/edge-response-model";
import { VertexResponse } from "../response/vertex-response-model";
import { Edge } from "./edge";
import { Property } from "./property";

export class Vertex {
    constructor(
        public id: string,
        public label: string,
        public properties: Property[],
        public outEdges: Edge[],
        public inEdges: Edge[],
        public positionX: number,
        public positionY: number,
        public radius: number
    ) {}

    public static fromResponse(vertexResponse: VertexResponse): Vertex {
        return new Vertex(
            vertexResponse.id,
            vertexResponse.name,
            vertexResponse.properties,
            vertexResponse.out_edges.map((edge: EdgeResponse) => Edge.fromResponse(edge)),
            vertexResponse.in_edges.map((edge: EdgeResponse) => Edge.fromResponse(edge)),
            vertexResponse.position_x,
            vertexResponse.position_y,
            vertexResponse.radius
        )
    }
}