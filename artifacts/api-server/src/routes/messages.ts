import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { wMessages, wCouples } from "@workspace/db";
import { eq, or, desc, lt } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const couples = await db
    .select()
    .from(wCouples)
    .where(or(eq(wCouples.user1Id, userId), eq(wCouples.user2Id, userId)))
    .limit(1);

  if (!couples.length) return res.status(403).json({ error: "Not in a couple" });

  const coupleId = couples[0].id;
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const before = req.query.before as string | undefined;

  const msgs = await db
    .select()
    .from(wMessages)
    .where(
      before
        ? lt(wMessages.createdAt, new Date(before))
        : eq(wMessages.coupleId, coupleId),
    )
    .orderBy(desc(wMessages.createdAt))
    .limit(limit);

  return res.json(
    msgs.map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
      editedAt: m.editedAt?.toISOString() ?? null,
      seenAt: m.seenAt?.toISOString() ?? null,
    })),
  );
});

router.delete("/:id", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  await db
    .update(wMessages)
    .set({ isDeleted: true })
    .where(eq(wMessages.id, req.params.id));

  return res.json({ success: true });
});

router.patch("/:id", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { content } = req.body;
  if (!content) return res.status(400).json({ error: "content required" });

  const [updated] = await db
    .update(wMessages)
    .set({ content, editedAt: new Date() })
    .where(eq(wMessages.id, req.params.id))
    .returning();

  if (!updated) return res.status(404).json({ error: "Message not found" });

  return res.json({
    ...updated,
    createdAt: updated.createdAt.toISOString(),
    editedAt: updated.editedAt?.toISOString() ?? null,
    seenAt: updated.seenAt?.toISOString() ?? null,
  });
});

export default router;
