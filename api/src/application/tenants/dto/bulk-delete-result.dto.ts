export class BulkDeleteResultDto {
    successful: string[];
    failed: Array<{
        id: string;
        error: string;
    }>;
    totalRequested: number;
    totalDeleted: number;
    totalFailed: number;

    constructor(successful: string[] = [], failed: Array<{ id: string; error: string }> = []) {
        this.successful = successful;
        this.failed = failed;
        this.totalRequested = successful.length + failed.length;
        this.totalDeleted = successful.length;
        this.totalFailed = failed.length;
    }

    static success(ids: string[]): BulkDeleteResultDto {
        return new BulkDeleteResultDto(ids, []);
    }

    static partial(
        successful: string[],
        failed: Array<{ id: string; error: string }>,
    ): BulkDeleteResultDto {
        return new BulkDeleteResultDto(successful, failed);
    }

    static failure(ids: string[], error: string): BulkDeleteResultDto {
        return new BulkDeleteResultDto(
            [],
            ids.map((id) => ({ id, error })),
        );
    }
}
