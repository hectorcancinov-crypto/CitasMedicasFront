import { db, FieldValue } from "./_firebase.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { patientId, fcmToken } = req.body || {};
  if (!patientId || !fcmToken) {
    return res.status(400).json({ error: "patientId and fcmToken required" });
  }

  try {
    await db.collection("patient_tokens").doc(String(patientId)).set({
      fcmToken,
      updatedAt: FieldValue.serverTimestamp()
    });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
