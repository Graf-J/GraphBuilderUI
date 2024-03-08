import { EdgeResponse } from "../response/edge-response-model";
import { GraphResponse } from "../response/graph-response-model";
import { VertexResponse } from "../response/vertex-response-model";
import { Edge } from "./edge";
import { Vertex } from "./vertex";

export class Graph {
    constructor(
        public edges: Edge[],
        public vertices: Vertex[]
    ) {}

    public static fromResponse(graphResponse: GraphResponse): Graph {
        return new Graph(
            graphResponse.edges.map((edge: EdgeResponse) => Edge.fromResponse(edge)),
            graphResponse.vertices.map((vertex: VertexResponse) => Vertex.fromResponse(vertex))
        );
    }
}
