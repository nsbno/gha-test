export class GetEnvironments {
    codeRepository;
    constructor(codeRepository) {
        this.codeRepository = codeRepository;
    }
    async execute() {
        const environments = await this.codeRepository.getEnvironments();
        if (!environments) {
            throw new Error('Failed to get environments');
        }
        return environments;
    }
}
