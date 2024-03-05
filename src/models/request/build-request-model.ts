export class BuildRequest {
    constructor(
        public port: number,
        public volume?: string
    ) {}
}