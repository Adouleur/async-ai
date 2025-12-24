const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface AnalyzeInput {
    name: string;
    age: number;
    description: string;
}

export interface AnalyzeResult {
    requestId: string;
    status?: string;
    result?: string;
    error?: string;
}

export const startAnalysis = async (data: AnalyzeInput) => {
    const res = await fetch(`${BASE_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json() as Promise<AnalyzeResult>;
};

export const getAnalysisStatus = async (requestId: string) => {
    const res = await fetch(`${BASE_URL}/analyze/${requestId}`);
    return res.json() as Promise<AnalyzeResult>;
};
