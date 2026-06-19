import Groq from "groq-sdk";

export const groq = new Groq({ apiKey: process.env.GROQ_API! });

// Cheapest / fastest Groq model.
export const MODEL = "llama-3.1-8b-instant";
