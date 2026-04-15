import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@ayasemota/firebase";

export interface Project {
  id: string;
  title: string;
  link: string;
  tech: string;
  description: string;
  date: string;
  index: number;
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "projects"), orderBy("index", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      setProjects(projectsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { projects, loading };
};
