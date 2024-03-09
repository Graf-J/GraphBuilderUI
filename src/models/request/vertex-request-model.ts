import { FormProperty } from '../form/property-form-model';
import { FormVertex } from '../form/vertex-form-model';
import { PropertyRequest } from './property-request-model';

export class VertexRequest {
    constructor(
        public name: string,
        public position_x: number,
        public position_y: number,
        public properties: PropertyRequest[]
    ) {}

    public static fromForm(formVertex: FormVertex): VertexRequest {
        return new VertexRequest(
            formVertex.name,
            formVertex.positionX,
            formVertex.positionY,
            formVertex.properties.map((property: FormProperty) => PropertyRequest.fromForm(property))
        )
    }

    public static fromFormWithPosition(formVertex: FormVertex, x: number, y: number): VertexRequest {
        return new VertexRequest(
            formVertex.name,
            x,
            y,
            formVertex.properties.map((property: FormProperty) => PropertyRequest.fromForm(property))
        )
    }
}