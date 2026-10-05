import { z } from "zod";
import { rephraseText } from "./rephrase.service.js";

const bodySchema = z.object({
  text: z.string().trim().min(1, "Text is required.").max(2000, "Text is too long (max 2000 characters)."),
});

export async function rephrase(req, res) {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  try {
    const rephrased = await rephraseText(parsed.data.text);
    res.json({ rephrased });
  } catch (err) {
    console.error("AI error:", err.message);
    res.status(502).json({ error: "The AI service failed. Please try again." });
  }
}
