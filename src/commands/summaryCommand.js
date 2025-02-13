import { SlashCommandBuilder } from "discord.js";
import { scrapeWebsite } from "../webutils.js";
import { ollamaChat } from "../ollama.js";
import { defaultModel, ollamaUrl } from "../config.js";

export const summaryCommandData = new SlashCommandBuilder()
  .setName("summary")
  .setDescription("Summarizes the information from a website and addresses a question.")
  .addStringOption((option) =>
    option
      .setName("url")
      .setDescription("The URL of the website to be summarized.")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("question")
      .setDescription("Additional question or focus for Ollama to address.")
       .setRequired(false)
  );

export async function handleSummary(interaction) {
  await interaction.deferReply();

  const url = interaction.options.getString("url");
  const userQuestion = interaction.options.getString("question") ?? "";  

  const content = await scrapeWebsite(url);
  if (!content) {
    await interaction.followUp("Error retrieving data or insufficient content.");
    return;
  }

  let prompt = `Read the following website and summarize it in a maximum of 2000 characters:\n\n${content}`;
  if (userQuestion.length > 0) {
    prompt += `\n\nAdditionally, address the question: "${userQuestion}"`;
  }
  

  const answer = await ollamaChat(defaultModel, prompt, ollamaUrl);

  
  if (answer.length <= 2000) {
    await interaction.followUp(answer);
  } else {
    await interaction.followUp(
    "Answer is too long – here is a shortened version:\n\n" + answer.slice(0, 2000)
    );
  }
}
