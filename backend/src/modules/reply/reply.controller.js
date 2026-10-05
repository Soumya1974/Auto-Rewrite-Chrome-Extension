import { z } from "zod";
import { generateReply } from "./reply.service.js";

const bodySchema = z.object({
  text: z.string().trim().min(1, "Text is required.").max(2000, "Text is too long (max 2000 characters)."),
  mode: z.enum(["reply", "casual"]).optional().default("reply"),
});

export async function reply(req, res) {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  try {
    const rephrased = await generateReply(parsed.data.text, parsed.data.mode);
    res.json({ rephrased });
  } catch (err) {
    console.error("AI reply error:", err.message);
    res.status(502).json({ error: "The AI reply service failed. Please try again." });
  }
}

