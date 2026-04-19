import admin from "firebase-admin";

function parseServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT env var is not set");

  let s = raw.trim();

  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  }

  let parsed;
  try {
    parsed = JSON.parse(s);
  } catch {
    const fixed = s.replace(/:\s*"([\s\S]*?)"(?=\s*[,}])/g, (_m, v) =>
      `:"${v.replace(/\r?\n/g, "\\n")}"`
    );
    parsed = JSON.parse(fixed);
  }

  if (parsed.private_key) {
    parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
  }

  return parsed;
}

export function getAdmin() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(parseServiceAccount())
    });
  }
  return {
    db: admin.firestore(),
    messaging: admin.messaging(),
    FieldValue: admin.firestore.FieldValue
  };
}
