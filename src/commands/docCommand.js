import { SlashCommandBuilder } from "discord.js";
import { ollamaChat } from "../ollama.js";
import { defaultModel, ollamaUrl } from "../config.js";

import mammoth from "mammoth";
import XLSX from "xlsx";

export const docCommandData = new SlashCommandBuilder()
  .setName("doc")
  .setDescription("Upload a Word or Excel file, optionally ask a question. (PDF not supported)")
  .addAttachmentOption(option =>
    option
      .setName("file")
      .setDescription("Document to parse (DOCX, XLS(X))")
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName("question")
      .setDescription("Optional question to focus on.")
      .setRequired(false)
  );

export async function handleDoc(interaction) {
  await interaction.deferReply({ ephemeral: false });

  const file = interaction.options.getAttachment("file");
  const userQuestion = interaction.options.getString("question") ?? "";

  if (!file?.contentType) {
    await interaction.followUp("Cannot detect file content type!");
    return;
  }

  let fileBuffer;
  try {
    const res = await fetch(file.url);
    fileBuffer = Buffer.from(await res.arrayBuffer());
  } catch (err) {
    console.error("[DOC Command] Download failed:", err);
    await interaction.followUp("Could not download the file. " + err.message);
    return;
  }

  let textContent = "";

  if (
    file.contentType.includes("wordprocessingml.document") ||
    file.name.endsWith(".docx")
  ) {
    console.log("[DOC] Word docx detected...");
    textContent = await parseDocx(fileBuffer);

  } else if (
    file.contentType.includes("spreadsheetml.sheet") ||
    file.name.endsWith(".xlsx") ||
    file.name.endsWith(".xls")
  ) {
    console.log("[DOC] Excel file detected...");
    textContent = await parseExcel(fileBuffer);

  } else {
    await interaction.followUp("Unsupported file type. Please upload DOCX or XLS(X).");
    return;
  }

  console.log(`[DOC] textContent length: ${textContent.length}`);
  if (textContent.length < 50) {
    await interaction.followUp("The parsed text is too short or could not be read.");
    return;
  }

  let prompt = `Please analyze the following document:\n\n${textContent}`;
  if (userQuestion) {
    prompt += `\n\nAnswer this question: "${userQuestion}"`;
  }

  const answer = await ollamaChat(defaultModel, prompt, ollamaUrl);
  const chunks = chunkString(answer, 2000);
  for (const c of chunks) {
    await interaction.followUp(c);
  }
}

async function parseDocx(buffer) {
  console.log("[DOC Command] parseDocx: Attempting mammoth...");
  try {
    const result = await mammoth.extractRawText({ buffer });
    console.log("[DOC Command] parseDocx: Done. Text length:", result.value?.length);
    return result.value ?? "";
  } catch (err) {
    console.error("Docx parse error:", err);
    return "";
  }
}

function parseExcel(buffer) {
  console.log("[DOC Command] parseExcel: Attempting xlsx...");
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    console.log("[DOC Command] parseExcel: Done. CSV length:", csv.length);
    return csv;
  } catch (err) {
    console.error("Excel parse error:", err);
    return "";
  }
}

function chunkString(str, maxLength) {
  if (!str) return [];
  const result = [];
  let i = 0;
  while (i < str.length) {
    result.push(str.slice(i, i + maxLength));
    i += maxLength;
  }
  return result;
}
