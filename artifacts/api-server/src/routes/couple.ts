import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { wCouples, wUsers } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { randomId, randomCode } from "../lib/utils";

const router = Router();

router.post("/create", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const existing = await db
    .select()
    .from(wCouples)
    .where(or(eq(wCouples.user1Id, userId), eq(wCouples.user2Id, userId)))
    .limit(1);

  if (existing.length) {
    const c = existing[0];
    const isLinked = !!c.user2Id;
    const partnerId = c.user1Id === userId ? c.user2Id : c.user1Id;
    let partnerDisplayName: string | null = null;
    if (partnerId) {
      const partner = await db
        .select()
        .from(wUsers)
        .where(eq(wUsers.id, partnerId))
        .limit(1);
      partnerDisplayName = partner[0]?.displayName ?? null;
    }
    return res.json({
      id: c.id,
      user1Id: c.user1Id,
      user2Id: c.user2Id ?? null,
      inviteCode: c.inviteCode,
      startDate: c.startDate.toISOString(),
      isLinked,
      partnerDisplayName,
    });
  }

  const { displayName, startDate } = req.body;
  if (displayName) {
    await db
      .insert(wUsers)
      .values({ id: userId, displayName })
      .onConflictDoUpdate({ target: wUsers.id, set: { displayName } });
  }

  const [couple] = await db
    .insert(wCouples)
    .values({
      id: randomId(),
      user1Id: userId,
      inviteCode: randomCode(),
      startDate: startDate ? new Date(startDate) : new Date(),
    })
    .returning();

  return res.json({
    id: couple.id,
    user1Id: couple.user1Id,
    user2Id: couple.user2Id ?? null,
    inviteCode: couple.inviteCode,
    startDate: couple.startDate.toISOString(),
    isLinked: false,
    partnerDisplayName: null,
  });
});

router.post("/join", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { inviteCode, displayName } = req.body;
  if (!inviteCode) return res.status(400).json({ error: "inviteCode required" });

  const couples = await db
    .select()
    .from(wCouples)
    .where(eq(wCouples.inviteCode, String(inviteCode).toUpperCase()))
    .limit(1);

  if (!couples.length)
    return res.status(404).json({ error: "Invalid invite code" });

  const couple = couples[0];
  if (couple.user1Id === userId)
    return res.status(400).json({ error: "Cannot join your own couple" });
  if (couple.user2Id)
    return res.status(400).json({ error: "This couple is already linked" });

  if (displayName) {
    await db
      .insert(wUsers)
      .values({ id: userId, displayName })
      .onConflictDoUpdate({ target: wUsers.id, set: { displayName } });
  }

  const [updated] = await db
    .update(wCouples)
    .set({ user2Id: userId })
    .where(eq(wCouples.id, couple.id))
    .returning();

  const partnerRows = await db
    .select()
    .from(wUsers)
    .where(eq(wUsers.id, couple.user1Id))
    .limit(1);

  return res.json({
    id: updated.id,
    user1Id: updated.user1Id,
    user2Id: updated.user2Id ?? null,
    inviteCode: updated.inviteCode,
    startDate: updated.startDate.toISOString(),
    isLinked: true,
    partnerDisplayName: partnerRows[0]?.displayName ?? null,
  });
});

router.get("/me", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const couples = await db
    .select()
    .from(wCouples)
    .where(or(eq(wCouples.user1Id, userId), eq(wCouples.user2Id, userId)))
    .limit(1);

  if (!couples.length) return res.status(404).json({ error: "No couple found" });

  const c = couples[0];
  const partnerId = c.user1Id === userId ? c.user2Id : c.user1Id;
  let partnerDisplayName: string | null = null;
  if (partnerId) {
    const partnerRows = await db
      .select()
      .from(wUsers)
      .where(eq(wUsers.id, partnerId))
      .limit(1);
    partnerDisplayName = partnerRows[0]?.displayName ?? null;
  }

  return res.json({
    id: c.id,
    user1Id: c.user1Id,
    user2Id: c.user2Id ?? null,
    inviteCode: c.inviteCode,
    startDate: c.startDate.toISOString(),
    isLinked: !!c.user2Id,
    partnerDisplayName,
  });
});

export default router;
