import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import { db } from "@ayz/firebase";

export interface Project {
  id?: string;
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
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "projects"), orderBy("index", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Project[];
      setProjects(projectsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addProject = async (project: Omit<Project, "id" | "index">) => {
    const newIndex =
      projects.length > 0 ? Math.max(...projects.map((p) => p.index)) + 1 : 0;
    await addDoc(collection(db, "projects"), {
      ...project,
      index: newIndex,
    });
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const projectRef = doc(db, "projects", id);
    await updateDoc(projectRef, updates);
  };

  const deleteProject = async (id: string) => {
    const projectRef = doc(db, "projects", id);
    await deleteDoc(projectRef);
  };

  const reorderProject = async (index: number, direction: "up" | "down") => {
    const newProjects = [...projects];
    const otherIndex = direction === "up" ? index - 1 : index + 1;

    if (otherIndex < 0 || otherIndex >= newProjects.length) return;

    try {
      const batch = writeBatch(db);

      const p1 = newProjects[index];
      const p2 = newProjects[otherIndex];

      if (!p1.id || !p2.id) {
        throw new Error("Missing project IDs for reordering");
      }

      const ref1 = doc(db, "projects", p1.id);
      const ref2 = doc(db, "projects", p2.id);

      // Swap the index values
      batch.update(ref1, { index: p2.index });
      batch.update(ref2, { index: p1.index });

      await batch.commit();
      console.log(`Reordered projects ${p1.title} and ${p2.title}`);
    } catch (error) {
      console.error("Failed to reorder projects:", error);
      throw error;
    }
  };

  return {
    projects,
    loading,
    addProject,
    updateProject,
    deleteProject,
    reorderProject,
  };
};
