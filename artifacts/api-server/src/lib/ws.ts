import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { createClerkClient } from "@clerk/express";
import { db } from "@workspace/db";
import { wMessages, wCouples } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { logger } from "./logger";
import { randomId } from "./utils";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

// coupleId -> set of active WebSocket connections
const rooms = new Map<string, Set<WebSocket>>();

function broadcast(coupleId: string, data: object, exclude?: WebSocket) {
  const room = rooms.get(coupleId);
  if (!room) return;
  const payload = JSON.stringify(data);
  for (const client of room) {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

function broadcastAll(coupleId: string, data: object) {
  const room = rooms.get(coupleId);
  if (!room) return;
  const payload = JSON.stringify(data);
  for (const client of room) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

export function initWs(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", async (ws, req) => {
    const url = new URL(req.url ?? "", `http://localhost`);
    const token = url.searchParams.get("token");

    if (!token) {
      ws.close(4001, "Unauthorized");
      return;
    }

    let userId: string;
    let coupleId: string;

    try {
      const payload = await clerkClient.verifyToken(token);
      userId = payload.sub;
    } catch {
      ws.close(4001, "Unauthorized");
      return;
    }

    try {
      const couples = await db
        .select()
        .from(wCouples)
        .where(
          or(eq(wCouples.user1Id, userId), eq(wCouples.user2Id, userId)),
        )
        .limit(1);
      if (!couples.length) {
        ws.close(4002, "No couple");
        return;
      }
      coupleId = couples[0].id;
    } catch (e) {
      logger.error(e, "WS: failed to get couple");
      ws.close(4003, "Error");
      return;
    }

    if (!rooms.has(coupleId)) rooms.set(coupleId, new Set());
    rooms.get(coupleId)!.add(ws);

    // Notify partner that user came online
    broadcast(coupleId, { type: "presence", userId, online: true }, ws);

    ws.on("message", async (raw) => {
      try {
        const event = JSON.parse(raw.toString());

        if (event.type === "message") {
          const { content, msgType = "text", mediaUrl } = event;
          if (!content?.trim()) return;

          const id = randomId();
          const [saved] = await db
            .insert(wMessages)
            .values({
              id,
              coupleId,
              senderId: userId,
              content: content.trim(),
              type: msgType,
              mediaUrl: mediaUrl ?? null,
            })
            .returning();

          const msgData = {
            ...saved,
            createdAt: saved.createdAt.toISOString(),
            editedAt: null,
            seenAt: null,
          };

          broadcastAll(coupleId, { type: "message", data: msgData });
        } else if (event.type === "typing") {
          broadcast(
            coupleId,
            { type: "typing", userId, isTyping: Boolean(event.isTyping) },
            ws,
          );
        } else if (event.type === "seen") {
          broadcast(coupleId, { type: "seen", userId }, ws);
        } else if (event.type === "delete") {
          const { messageId } = event;
          if (!messageId) return;
          await db
            .update(wMessages)
            .set({ isDeleted: true })
            .where(eq(wMessages.id, messageId));
          broadcastAll(coupleId, {
            type: "message_deleted",
            messageId,
          });
        }
      } catch (e) {
        logger.error(e, "WS: failed to handle message");
      }
    });

    ws.on("close", () => {
      rooms.get(coupleId)?.delete(ws);
      broadcast(coupleId, { type: "presence", userId, online: false });
    });

    ws.on("error", (err) => {
      logger.error(err, "WS client error");
    });
  });

  logger.info("WebSocket server initialized");
}
