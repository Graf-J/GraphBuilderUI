import { FormProject } from "../form/project-form-model";

export class ProjectRequest {
    constructor(
        public name: string
    ) {}

    public static fromForm(formProject: FormProject): ProjectRequest {
        return new ProjectRequest(formProject.name);
    }
}