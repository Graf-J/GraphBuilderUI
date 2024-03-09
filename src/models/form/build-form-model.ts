export class FormBuild {
    constructor(
        public port: number,
        public portErrorMessage: string,
        public volume: string | undefined,
        public volumeErrorMessage: string
    ) {}

    public static empty(): FormBuild {
        return new FormBuild(5000, '', undefined, '');
    }
}