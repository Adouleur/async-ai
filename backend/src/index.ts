import "dotenv/config";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { nanoid } from "nanoid";
import { cors } from "hono/cors";
import { Client } from "@upstash/qstash";
import { setRecord, getRecord } from "./redis";
import { AnalysisRecord } from "./types";
import OpenAI from "openai";

const app = new Hono();
app.use("*", cors());

const qstashClient = new Client({
    token: process.env.QSTASH_TOKEN!
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function analyzeText(name: string, age: number, description: string) {
    const prompt = `Analyze this person: Name: ${name}, Age: ${age}, Description: ${description}`;
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }]
    });
    return response.choices[0].message?.content ?? "No result";
}

app.get("/", (c) => c.text("Backend with Redis, QStash, and OpenAI is running"));

app.post("/analyze", async (c) => {
    try {
        const { name, age, description } = await c.req.json();

        if (!name || !age || !description)
            return c.json({ error: "Invalid input" }, 400);

        const requestId = nanoid();
        const key = `analysis:${requestId}`;

        const record: AnalysisRecord = {
            requestId,
            status: "pending",
            input: { name, age: Number(age), description }
        };

        await setRecord(key, record);

        await qstashClient.publishJSON({
            url: `${process.env.BACKEND_URL}/webhook/analyze`,
            body: {requestId} ,
            delay: 60
        });

        return c.json({ requestId });
    } catch (err) {
        console.error(err);
        return c.json({ error: "Internal server error" }, 500);
    }
});

app.post("/webhook/analyze", async (c) => {
    try {
        const { requestId } = await c.req.json();
        const key = `analysis:${requestId}`;
        const record = await getRecord<AnalysisRecord>(key);

        if (!record) return c.json({ error: "not found" }, 404);

        record.status = "processing";
        await setRecord(key, record);

        try {
            const result = await analyzeText(
                record.input.name,
                record.input.age,
                record.input.description
            );

            record.status = "completed";
            record.result = result;
        } catch (err) {
            console.error(err);
            record.status = "failed";
            record.error = "AI analysis failed";
        }

        await setRecord(key, record);

        return c.json({ ok: true });
    } catch (err) {
        console.error(err);
        return c.json({ ok: false, error: "Internal server error" }, 500);
    }
});

app.get("/analyze/:requestId", async (c) => {
    const requestId = c.req.param("requestId");
    const key = `analysis:${requestId}`;
    const record = await getRecord<AnalysisRecord>(key);

    if (!record) return c.json({ error: "not found" }, 404);
    return c.json(record);
});

serve(
    { fetch: app.fetch, port: 3000 },
    () => console.log("Backend running on http://localhost:3000")
);
