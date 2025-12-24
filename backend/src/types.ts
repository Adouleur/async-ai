export type AnalysisStatus =
    | "pending"
    | "processing"
    | "completed"
    | "failed";

export interface AnalysisRecord {
    requestId: string;
    status: AnalysisStatus;
    input: {
        name: string;
        age: number;
        description: string;
    };
    result?: string;
    error?: string;
}
