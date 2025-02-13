import {
    REST,
    Routes,
  } from "discord.js";
  import { token, clientId, guildId } from "../config.js";
  
  import { askCommandData, handleAsk } from "./askCommand.js";
  import { summaryCommandData, handleSummary } from "./summaryCommand.js";
  
  const commandsData = [
    askCommandData,
    summaryCommandData,
  ];
  

  export async function registerSlashCommands() {
    const rest = new REST({ version: "10" }).setToken(token);
    try {
      const result = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commandsData.map((c) => c.toJSON()) }
      );
      console.log(`Slash commands for guild ${guildId} have been registered:`, result);
    } catch (error) {
        console.error("Error registering slash commands:", error);
    }
  }
  

  export function setupInteractionHandler(client) {
    client.on("interactionCreate", async (interaction) => {
      if (!interaction.isChatInputCommand()) return;
  
      const { commandName } = interaction;
      if (commandName === "ask") {
        await handleAsk(interaction);
      } else if (commandName === "summary") {
        await handleSummary(interaction);
      }
    });
  }
  