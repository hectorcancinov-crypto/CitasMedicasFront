import { getAdmin } from "./_firebase.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { patientId, doctorName, appointmentId } = req.body || {};
  if (!patientId) return res.status(400).json({ error: "patientId required" });

  try {
    const { db, messaging } = getAdmin();
    const snap = await db.collection("patient_tokens").doc(String(patientId)).get();
    if (!snap.exists) return res.status(404).json({ error: "patient token not found" });

    const { fcmToken } = snap.data();
    const messageId = await messaging.send({
      token: fcmToken,
      notification: {
        title: "Cita aceptada ✅",
        body: `Tu cita con ${doctorName ?? "el doctor"} fue confirmada.`
      },
      data: {
        appointmentId: String(appointmentId ?? ""),
        type: "appointment_accepted"
      }
    });
    return res.json({ ok: true, messageId });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
