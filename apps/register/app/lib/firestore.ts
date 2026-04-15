import { doc, setDoc, getDocs, query, collection, where, Timestamp } from "firebase/firestore";
import { db } from "@ayasemota/firebase";

interface RegistrationData {
  fields: Record<string, string>;
  answers: Record<string, string>;
}

function generateDocId(email: string, firstName: string, lastName: string, phone: string): string {
  if (email) {
    return email.toLowerCase().replace(/[^a-z0-9@.]/g, '');
  }
  const name = `${firstName}_${lastName}_${phone}`.toLowerCase().replace(/\s+/g, "_");
  return name || `user_${Date.now()}`;
}

export async function checkUniqueField(field: string, value: string): Promise<boolean> {
  const q = query(collection(db, "users"), where(field, "==", value));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

export async function saveRegistration(data: RegistrationData): Promise<string> {
  const firstName = data.fields.firstName || "";
  const lastName = data.fields.lastName || "";
  const docId = generateDocId(data.fields.email || "", firstName, lastName, data.fields.phone || "");

  const rawDoc = {
    firstName,
    lastName,
    email: data.fields.email,
    phone: data.fields.phone,
    pin: data.fields.pin,
    dateOfBirth: data.fields.dateOfBirth,
    telegramUsername: data.fields.telegramUsername,
    skillLevel: data.answers["skill-level"],
    budget: data.fields.budget,
    unclearedAmount: parseFloat(String(data.fields.budget || "").replace(/[^0-9.]/g, '')) || 0,
    paymentStructure: data.answers["payment-structure"],
    status: "Pending",
    registeredAt: Timestamp.now(),
  };

  const userDoc = Object.fromEntries(
    Object.entries(rawDoc).filter(
      (entry) =>
        entry[1] !== undefined && entry[1] !== "" && entry[1] !== "Skip"
    )
  );

  await setDoc(doc(db, "users", docId), userDoc);
  return docId;
}