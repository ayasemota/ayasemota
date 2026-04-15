import { db } from "@ayasemota/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

const projects = [
  {
    title: "Paycort",
    link: "https://ayz-paycort.vercel.app/",
    date: "2025",
    tech: "Next.js, TypeScript, Firebase",
    description: "Paycort | AI Tax Integration App",
  },
  {
    title: "Kosa",
    link: "https://ayz-kosa.vercel.app/",
    date: "2026",
    tech: "Next.js, TailwindCSS",
    description: "Kosa | Just a girl living her best life",
  },
  {
    title: "SnapCode",
    link: "https://ayz-snapcode.vercel.app/",
    date: "2025",
    tech: "Next.js, TailwindCSS",
    description: "Generate QR codes instantly",
  },
];

async function migrate() {
  console.log("Starting migration...");
  const projectsRef = collection(db, "projects");
  
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    // Check if exists
    const q = query(projectsRef, where("title", "==", p.title));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      await addDoc(projectsRef, { ...p, index: i });
      console.log(`Migrated: ${p.title}`);
    } else {
      console.log(`Skipped (already exists): ${p.title}`);
    }
  }
  console.log("Migration complete!");
}

migrate();
