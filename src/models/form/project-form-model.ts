export class FormProject {
    constructor(
        public name: string,
        public nameErrorMessage: string,
    ) {}

    public static empty(): FormProject {
        return new FormProject('', '')
    }
}