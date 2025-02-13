import { Ollama } from "ollama";
import { assistantDescription } from "./config.js";

/**
 * 
 * @param {string} model 
 * @param {string} prompt 
 * @param {string} host   
 * @returns {Promise<string>} 
 */
export async function ollamaChat(model, prompt, host) {
  const ollama = new Ollama({
    host,
    headers: { "x-some-header": "some-value" },
  });


  const messages = [];

  if (assistantDescription.trim().length > 0) {
    messages.push({
      role: "system",
      content: assistantDescription
    });
  }

  messages.push({
    role: "user",
    content: prompt
  });

  try {
    const response = await ollama.chat({
      model,
      messages
    });

    if (response?.message?.content) {
      return response.message.content;
    }
    return "No response received from Ollama.";
    } catch (error) {
    console.error("Error with Ollama request:", error);
    return `Error connecting to Ollama: ${error.message}`;
}

}
