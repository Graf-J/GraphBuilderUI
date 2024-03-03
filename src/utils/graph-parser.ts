import { EdgeResponse } from "@/models/response/edge-response-model";
import { GraphResponse } from "@/models/response/graph-response-model";
import { VertexResponse } from "@/models/response/vertex-response-model";
import { v4 as uuidv4 } from 'uuid';

export function parseVertexToElement(vertex: VertexResponse) {
    return {
      data: {
        id: vertex.id,
        label: vertex.name,
        properties: vertex.properties.map((property) => ({
          id: uuidv4(),
          key: property.key,
          required: property.required,
          datatype: property.datatype,
        })),
        radius: vertex.radius
      },
      position: {
        x: vertex.position_x,
        y: vertex.position_y,
      },
      style: {
        width: vertex.radius * 2,
        height: vertex.radius * 2,
      },
    }
}

export function parseEdgeToElement(edge: EdgeResponse) {
  return {
    data: {
      id: edge.id,
      label: edge.name,
      multiEdge: edge.multi_edge,
      properties: edge.properties.map((property) => ({
        id: uuidv4(),
        key: property.key,
        required: property.required,
        datatype: property.datatype
      })),
      source: edge.source_vertex_id,
      target: edge.target_vertex_id,
    },
  }
}

export function parseGraphToElements(graph: GraphResponse) {
    const graphElements: any = [];
  
    graph.vertices.forEach((vertex: VertexResponse) => {
      graphElements.push(parseVertexToElement(vertex));
    });
  
    graph.edges.forEach((edge: EdgeResponse) => {
      graphElements.push(parseEdgeToElement(edge));
    });
  
    return graphElements;
  }