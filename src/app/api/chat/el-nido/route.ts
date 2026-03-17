import Anthropic from "@anthropic-ai/sdk";
import { EL_NIDO_SYSTEM_PROMPT } from "~/lib/microapps/el-nido-chat/system-prompt";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      messages: { role: "user" | "assistant"; content: string }[];
    };

    if (!body.messages?.length) {
      return Response.json({ error: "Messages required" }, { status: 400 });
    }

    // Limit conversation history to last 20 messages to manage token usage
    const messages = body.messages.slice(-20);

    const stream = anthropic.messages.stream({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: EL_NIDO_SYSTEM_PROMPT,
      messages,
    });

    // Stream the response using SSE
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ text: event.delta.text })}\n\n`
                )
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          const message = err instanceof Error ? err.message : "Stream error";
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("El Nido chat error:", err);
    return Response.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
