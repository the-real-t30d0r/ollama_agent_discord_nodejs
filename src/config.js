import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, "../config.json");
const raw = fs.readFileSync(configPath, "utf8");
const config = JSON.parse(raw);

export const token = config.token;
export const clientId = config.client_id;   
export const guildId = config.guild_id;
export const ollamaUrl = config.ollama_url || "http://127.0.0.1:11434/";
export const defaultModel = config.default_model;
export const assistantDescription = config.assistant_description || ""; 
