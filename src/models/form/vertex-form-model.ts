import { Edge } from "../application/edge";
import { Property } from "../application/property";
import { Vertex } from "../application/vertex";
import { FormEdge } from "./edge-form-model";
import { FormProperty } from "./property-form-model";

export class FormVertex {
    constructor(
        public id: string | null,
        public name: string,
        public radius: number,
        public positionX: number,
        public positionY: number,
        public properties: FormProperty[],
        public nameErrorMessage: string
    ) {}

    public static empty(): FormVertex {
        return new FormVertex(
            null,
            '',
            30,
            0,
            0,
            [],
            ''
        );
    }

    public static fromVertex(vertex: Vertex): FormVertex {
        return new FormVertex(
            vertex.id,
            vertex.label,
            Math.round(vertex.radius),
            vertex.positionX,
            vertex.positionY,
            vertex.properties.map((property: Property) => FormProperty.fromProperty(property)),
            ''
        )
    }
}
