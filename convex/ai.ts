"use node";

import { v } from "convex/values";
import OpenAI from "openai";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

const SYSTEM_PROMPT = `You are Folio, a careful writing partner inside a classic document editor.

Use the writer's knowledge notes as source material. Prefer facts from those notes over invention. If the notes do not cover something, say so briefly rather than fabricating.

When you write or edit the document, use HTML that TipTap can render: p, h1, h2, h3, ul, ol, li, blockquote, strong, em, u, and a. Do not use markdown. Do not wrap the HTML in code fences.

If the writer asks you to draft, rewrite, expand, or change the document, call the appropriate tool. Always include a short conversational reply describing what you changed. If they only asked a question, reply in chat without editing.`;

const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "replace_document",
      description: "Replace the entire document with new HTML.",
      parameters: {
        type: "object",
        properties: {
          html: {
            type: "string",
            description: "The full document as HTML.",
          },
        },
        required: ["html"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "insert_html",
      description: "Append an HTML passage to the end of the document.",
      parameters: {
        type: "object",
        properties: {
          html: {
            type: "string",
            description: "HTML to append.",
          },
        },
        required: ["html"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "edit_selection",
      description:
        "Replace the first occurrence of a quoted excerpt with new HTML.",
      parameters: {
        type: "object",
        properties: {
          excerpt: {
            type: "string",
            description: "Existing text or HTML to find in the document.",
          },
          html: {
            type: "string",
            description: "Replacement HTML.",
          },
        },
        required: ["excerpt", "html"],
      },
    },
  },
];

function formatKnowledge(items: Array<Doc<"knowledgeItems">>): string {
  if (items.length === 0) {
    return "No knowledge notes have been added for this document.";
  }
  return items
    .map((item, index) => `Note ${index + 1}: ${item.title}\n${item.body}`)
    .join("\n\n");
}

function applyDocumentTools(
  currentContent: string,
  toolCalls: OpenAI.Chat.ChatCompletionMessageToolCall[],
): string {
  let content = currentContent;
  for (const toolCall of toolCalls) {
    if (toolCall.type !== "function") {
      continue;
    }
    const args = JSON.parse(toolCall.function.arguments) as {
      html?: string;
      excerpt?: string;
    };
    if (toolCall.function.name === "replace_document" && args.html) {
      content = args.html;
    } else if (toolCall.function.name === "insert_html" && args.html) {
      content = `${content}${args.html}`;
    } else if (
      toolCall.function.name === "edit_selection" &&
      args.excerpt &&
      args.html
    ) {
      content = content.includes(args.excerpt)
        ? content.replace(args.excerpt, args.html)
        : `${content}${args.html}`;
    }
  }
  return content;
}

export const sendMessage = action({
  args: {
    documentId: v.id("documents"),
    message: v.string(),
  },
  returns: v.object({
    reply: v.string(),
    content: v.string(),
  }),
  handler: async (ctx, args): Promise<{ reply: string; content: string }> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        "OPENAI_API_KEY is not set. Add it in the Convex dashboard environment variables.",
      );
    }

    const turn: {
      document: Doc<"documents">;
      knowledge: Array<Doc<"knowledgeItems">>;
      messages: Array<Doc<"chatMessages">>;
    } = await ctx.runMutation(internal.chat.startTurn, {
      documentId: args.documentId,
      message: args.message,
    });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "system",
          content: `Knowledge notes:\n${formatKnowledge(turn.knowledge)}`,
        },
        {
          role: "system",
          content: `Current document HTML:\n${turn.document.content || "(empty)"}`,
        },
        ...turn.messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
      tools,
    });

    const choice = completion.choices[0]?.message;
    if (!choice) {
      throw new Error("OpenAI returned an empty response.");
    }

    const toolCalls = choice.tool_calls ?? [];
    const nextContent =
      toolCalls.length > 0
        ? applyDocumentTools(turn.document.content, toolCalls)
        : turn.document.content;
    const reply =
      choice.content?.trim() ||
      (toolCalls.length > 0
        ? "I updated the document using your notes."
        : "I could not produce a reply.");

    const saved: { content: string } = await ctx.runMutation(
      internal.chat.finishTurn,
      {
        documentId: args.documentId,
        reply,
        content: nextContent !== turn.document.content ? nextContent : undefined,
      },
    );

    return { reply, content: saved.content };
  },
});
