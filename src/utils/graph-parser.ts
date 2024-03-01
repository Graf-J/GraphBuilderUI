import { Edge } from "@/models/edge-model";
import { Graph } from "@/models/graph-model";
import { Vertex } from "@/models/vertex-model";

export function parseGraphToElements(graph: Graph) {
    const graphElements: any = [];
  
    graph.vertices.forEach((vertex: Vertex) => {
      graphElements.push({
        data: {
          id: vertex.id,
          label: vertex.name,
          properties: vertex.properties,
        },
        position: {
          x: vertex.position_x,
          y: vertex.position_y,
        },
        style: {
          width: vertex.radius * 2,
          height: vertex.radius * 2,
        },
      });
    });
  
    graph.edges.forEach((edge: Edge) => {
      graphElements.push({
        data: {
          id: edge.id,
          label: edge.name,
          multiEdge: edge.multi_edge,
          properties: edge.properties,
          source: edge.source_vertex_id,
          target: edge.target_vertex_id,
        },
      });
    });
  
    return graphElements;
  }