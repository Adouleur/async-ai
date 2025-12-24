import { useState, useEffect } from "react";
import "./analyzeForm.css";
import {type AnalyzeInput, getAnalysisStatus, startAnalysis} from "../../api/analyze.ts";

interface AnalysisRequest {
    requestId: string;
    status: string;
    result?: string;
    input: AnalyzeInput;
}

export default function AnalyzeForm() {
    const [form, setForm] = useState<AnalyzeInput>({ name: "", age: 0, description: "" });
    const [requests, setRequests] = useState<AnalysisRequest[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = await startAnalysis(form);
        setRequests(prev => [
            ...prev,
            { requestId: data.requestId, status: "pending", input: { ...form } }
        ]);
        setForm({ name: "", age: 0, description: "" });
    };

    useEffect(() => {
        if (requests.length === 0) return;

        const interval = setInterval(async () => {
            try {
                const updatedRequests = await Promise.all(
                    requests.map(async (r) => {
                        if (!r.requestId) return { ...r, status: "Error" };

                        if (r.status === "completed" || r.status === "failed") return r;

                        try {
                            const res = await getAnalysisStatus(r.requestId);

                            return {
                                ...r,
                                status: res.status ?? "pending",
                                result: res.result ?? undefined,
                            };
                        } catch (err) {
                            console.error(`Error getting status for ${r.requestId}:`, err);
                            return { ...r, status: "error" };
                        }
                    })
                );
                setRequests(updatedRequests as AnalysisRequest[]);
            } catch (err) {
                console.error("Query update error:", err);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [requests]);


    return (
        <div style={{ maxWidth: 600, margin: "auto" }}>
            <form className="analyze-form" onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
                <input
                    name="name"
                    placeholder="Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                />
                <input
                    name="age"
                    type="number"
                    placeholder="Age"
                    value={form.age}
                    onChange={handleChange}
                    required
                />
                <textarea
                    name="description"
                    placeholder="Short description"
                    value={form.description}
                    onChange={handleChange}
                    required
                />
                <button type="submit">Analyze</button>
            </form>

            <div>
                <h2>Active Analyses</h2>
                {requests.length === 0 && <p>No analyses yet</p>}
                {requests.map((r) => (
                    <div key={r.requestId} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
                        <p><strong>Request ID:</strong> {r.requestId! ? r.requestId : "Request ID is not recieved"}</p>
                        <p><strong>Status:</strong> {r.status}</p>
                        <p><strong>Name:</strong> {r.input.name}</p>
                        <p><strong>Age:</strong> {r.input.age}</p>
                        <p><strong>Description:</strong> {r.input.description}</p>
                        {r.result && (
                            <div>
                                <h4>Result:</h4>
                                <p>{r.result}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
