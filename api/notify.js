import { getAdmin } from "./_firebase.js";

const TEMPLATES = {
  accepted: (doctor) => ({
    title: "Cita aceptada ✅",
    body:
      `Tu cita con ${doctor} fue confirmada. ` +
      "Recomendaciones: llega 10 minutos antes, lleva tus estudios previos si los tienes, " +
      "una lista de tus medicamentos actuales y tu documento de identidad.",
    type: "appointment_accepted"
  }),
  rejected: (doctor) => ({
    title: "Cita no disponible ❌",
    body:
      `Tu cita con ${doctor} no pudo ser aceptada. ` +
      "Por favor contacta al médico o reprograma la cita desde la app.",
    type: "appointment_rejected"
  })
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { patientId, doctorName, appointmentId, status = "accepted" } = req.body || {};
  if (!patientId) return res.status(400).json({ error: "patientId required" });

  const template = TEMPLATES[status];
  if (!template) {
    return res.status(400).json({ error: `invalid status: ${status}` });
  }

  try {
    const { db, messaging } = getAdmin();
    const snap = await db.collection("patient_tokens").doc(String(patientId)).get();
    if (!snap.exists) return res.status(404).json({ error: "patient token not found" });

    const { fcmToken } = snap.data();
    const { title, body, type } = template(doctorName ?? "el doctor");

    const messageId = await messaging.send({
      token: fcmToken,
      notification: { title, body },
      data: {
        appointmentId: String(appointmentId ?? ""),
        type
      }
    });
    return res.json({ ok: true, messageId });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
