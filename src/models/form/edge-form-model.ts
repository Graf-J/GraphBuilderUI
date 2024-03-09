import { Edge } from "../application/edge";
import { Property } from "../application/property";
import { FormProperty } from "./property-form-model";

export class FormEdge {
    constructor(
        public id: string | null,
        public name: string,
        public multiEdge: boolean,
        public sourceVertexName: string,
        public targetVertexName: string,
        public properties: FormProperty[],
        public nameErrorMessage: string
    ) {}

    public static empty(): FormEdge {
        return new FormEdge(
            null,
            '',
            true,
            '',
            '',
            [],
            ''
        );
    }

    public static fromEdge(edge: Edge, sourceVertexName: string, targetVertexName: string): FormEdge {
        return new FormEdge(
            edge.id,
            edge.label,
            edge.multiEdge,
            sourceVertexName,
            targetVertexName,
            edge.properties.map((property: Property) => FormProperty.fromProperty(property)),
            ''
        )
    }
}