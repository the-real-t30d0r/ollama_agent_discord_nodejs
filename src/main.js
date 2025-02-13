import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

import {
  Client,
  GatewayIntentBits,
  Partials,
} from "discord.js";
import { token } from "./config.js";
import { registerSlashCommands, setupInteractionHandler } from "./commands/index.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

setupInteractionHandler(client);

client.once("ready", async () => {
  console.log(`Bot ist online als ${client.user.tag}`);
  await registerSlashCommands();
});

client.login(token).catch(console.error);
