import { FormBuild } from "../form/build-form-model";

export class BuildRequest {
    constructor(
        public port: number,
        public volume?: string
    ) {}

    public static fromForm(formBuild: FormBuild): BuildRequest {
        return new BuildRequest(
            formBuild.port,
            formBuild.volume === '' ? undefined : formBuild.volume
        )
    }
}