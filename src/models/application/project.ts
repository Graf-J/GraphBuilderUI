import { ProjectResponse } from "../response/project-response-model";

export class Project {
    constructor(
        public id: string, 
        public name: string
    ) { }

    public static fromResponse(projectResponse: ProjectResponse): Project {
        return new Project(projectResponse.id, projectResponse.name);
    }
}