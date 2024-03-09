import { Property } from "../application/property";
import { Vertex } from "../application/vertex";
import { FormProperty } from "./property-form-model";

export class FormVertex {
    constructor(
        public id: string | null,
        public name: string,
        public positionX: number,
        public positionY: number,
        public properties: FormProperty[],
        public nameErrorMessage: string
    ) {}

    public static empty(): FormVertex {
        return new FormVertex(
            null,
            '',
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
            vertex.positionX,
            vertex.positionY,
            vertex.properties.map((property: Property) => FormProperty.fromProperty(property)),
            ''
        )
    }
}
