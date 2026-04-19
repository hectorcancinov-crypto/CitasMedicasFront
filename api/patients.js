import { getAdmin } from "./_firebase.js";

export default async function handler(_req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const { db } = getAdmin();
    const snap = await db.collection("patient_tokens").get();
    res.json(snap.docs.map(d => ({ patientId: d.id, ...d.data() })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
