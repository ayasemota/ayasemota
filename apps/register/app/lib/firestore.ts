import { doc, setDoc, getDocs, query, collection, where, Timestamp } from "firebase/firestore";
import { db } from "@ayasemota/firebase";

interface RegistrationData {
  fields: Record<string, string>;
  answers: Record<string, string>;
}

function generateDocId(firstName: string, lastName: string): string {
  const name = `${firstName}_${lastName}`.toLowerCase().replace(/\s+/g, "_");
  const timestamp = Date.now();
  return `${name}_${timestamp}`;
}

export async function checkUniqueField(field: string, value: string): Promise<boolean> {
  const q = query(collection(db, "users"), where(field, "==", value));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

export async function saveRegistration(data: RegistrationData): Promise<string> {
  const firstName = data.fields.firstName || "";
  const lastName = data.fields.lastName || "";
  const docId = generateDocId(firstName, lastName);

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
    paymentStructure: data.answers["payment-structure"],
    status: "Pending",
    registeredAt: Timestamp.now(),
  };

  const userDoc = Object.fromEntries(
    Object.entries(rawDoc).filter((entry) => entry[1] !== undefined && entry[1] !== "")
  );

  await setDoc(doc(db, "users", docId), userDoc);
  return docId;
}