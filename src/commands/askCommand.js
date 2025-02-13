import { SlashCommandBuilder } from "discord.js";
import { performWebSearch, scrapeWebsite } from "../webutils.js";
import { ollamaChat } from "../ollama.js";
import { defaultModel, ollamaUrl } from "../config.js";

export const askCommandData = new SlashCommandBuilder()
  .setName("ask")
  .setDescription("Sends your prompt to Ollama, optionally with web search as context.")
  .addStringOption((option) =>
    option
      .setName("prompt")
      .setDescription("Your prompt or your question.")
      .setRequired(true)
  )
  .addBooleanOption((option) =>
    option
      .setName("use_web")
      .setDescription("Should a web search be used as context?")
      .setRequired(false)
  );

export async function handleAsk(interaction) {
  await interaction.deferReply();
  const prompt = interaction.options.getString("prompt");
  const useWeb = interaction.options.getBoolean("use_web") ?? false;

  let combinedPrompt = prompt;
  if (useWeb) {
    const webResults = await performWebSearch(prompt);
    combinedPrompt = 
      `Based on the following web search results:\n\n${webResults}\n\n` +
      `Summarize the key information and answer the question: ${prompt}`;

  }

  const answer = await ollamaChat(defaultModel, combinedPrompt, ollamaUrl);
  await interaction.followUp(answer);
}
