"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Briefcase,
  ExternalLink,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Save,
  X,
  User as UserIcon,
} from "lucide-react";
import { useProjects, Project } from "@/hooks/useProjects";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@ayasemota/firebase";
import { useToast } from "../ToastContext";

export default function ProjectsSection() {
  const {
    projects,
    loading,
    addProject,
    updateProject,
    deleteProject,
    reorderProject,
  } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const [about, setAbout] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [isSavingSkills, setIsSavingSkills] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const docRef = doc(db, "settings", "portfolio");
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const d = snapshot.data();
        if (!isInitialized) {
          setAbout(
            Array.isArray(d.about) ? d.about.join("\n\n") : d.about || "",
          );
          setSkills(Array.isArray(d.skills) ? d.skills : []);
          setIsInitialized(true);
        }
      } else {
        setIsInitialized(true);
      }
    });
    return () => unsubscribe();
  }, [isInitialized]);

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleReorderSkill = (index: number, direction: "left" | "right") => {
    const newSkills = [...skills];
    const otherIndex = direction === "left" ? index - 1 : index + 1;
    if (otherIndex < 0 || otherIndex >= newSkills.length) return;
    [newSkills[index], newSkills[otherIndex]] = [
      newSkills[otherIndex],
      newSkills[index],
    ];
    setSkills(newSkills);
  };

  const handleSaveBio = async () => {
    setIsSavingBio(true);
    try {
      const docRef = doc(db, "settings", "portfolio");
      await setDoc(
        docRef,
        {
          about: about.split("\n\n").filter((p) => p.trim() !== ""),
        },
        { merge: true },
      );
      showToast("Bio updated successfully!");
    } catch (err) {
      console.error(err);
      showToast("Failed to save bio");
    } finally {
      setIsSavingBio(false);
    }
  };

  const handleSaveSkills = async () => {
    setIsSavingSkills(true);
    try {
      const docRef = doc(db, "settings", "portfolio");
      await setDoc(
        docRef,
        {
          skills: skills,
        },
        { merge: true },
      );
      showToast("Skills updated successfully!");
    } catch (err) {
      console.error(err);
      showToast("Failed to save skills");
    } finally {
      setIsSavingSkills(false);
    }
  };
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<Omit<Project, "id" | "index">>({
    title: "",
    link: "",
    tech: "",
    description: "",
    date: new Date().getFullYear().toString(),
  });

  const handleOpenAdd = () => {
    setEditingProject(null);
    setFormData({
      title: "",
      link: "",
      tech: "",
      description: "",
      date: new Date().getFullYear().toString(),
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      link: project.link,
      tech: project.tech,
      description: project.description,
      date: project.date,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject?.id) {
      await updateProject(editingProject.id, formData);
    } else {
      await addProject(formData);
    }
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <UserIcon className="text-primary" />
          Identity
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6 space-y-4 shadow-sm">
            <label className="text-xs font-bold uppercase text-muted-foreground block">
              About Me
            </label>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="w-full h-64 px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none resize-none text-sm leading-relaxed"
              placeholder="Separate paragraphs with double newlines..."
            />
            <div className="pt-2">
              <button
                onClick={handleSaveBio}
                disabled={isSavingBio}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm font-medium disabled:opacity-50"
              >
                <Save size={18} />
                {isSavingBio ? "Saving..." : "Save Bio"}
              </button>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 space-y-4 shadow-sm h-full flex flex-col">
            <label className="text-xs font-bold uppercase text-muted-foreground block">
              Skills & Expertise
            </label>
            
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="Type a skill and press Enter..."
                />
                <button
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm font-medium"
                >
                  Add
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {skills.length > 0 ? (
                  skills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="group p-3 bg-secondary/30 border border-border rounded-lg flex flex-col gap-2 hover:border-primary/50 transition-all shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-medium text-foreground truncate">{skill}</span>
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="p-1 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="flex justify-between items-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all pt-1 border-t border-border/50">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleReorderSkill(idx, "left")}
                            disabled={idx === 0}
                            className="p-1 hover:bg-muted rounded text-muted-foreground disabled:opacity-30"
                          >
                            <ArrowLeft size={14} />
                          </button>
                          <button
                            onClick={() => handleReorderSkill(idx, "right")}
                            disabled={idx === skills.length - 1}
                            className="p-1 hover:bg-muted rounded text-muted-foreground disabled:opacity-30"
                          >
                            <ArrowRight size={14} />
                          </button>
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">#{idx + 1}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-8 text-center text-muted-foreground italic text-sm border-2 border-dashed border-border rounded-xl">
                    No skills added yet. Break it down!
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSaveSkills}
                disabled={isSavingSkills}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm font-medium disabled:opacity-50"
              >
                <Save size={18} />
                {isSavingSkills ? "Saving..." : "Save Skills"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Briefcase className="text-primary" />
          Projects
        </h2>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm font-medium"
        >
          <Plus size={20} />
          Add Project
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="px-6 py-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Project
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Tech Stack
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Year
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {projects.map((project, index) => (
              <tr
                key={project.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => reorderProject(index, "up")}
                      disabled={index === 0}
                      className="p-1 hover:bg-muted rounded disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move Up"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      onClick={() => reorderProject(index, "down")}
                      disabled={index === projects.length - 1}
                      className="p-1 hover:bg-muted rounded disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move Down"
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="font-bold text-foreground">
                      {project.title}
                    </div>
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5"
                    >
                      {new URL(project.link).hostname}{" "}
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {project.tech}
                </td>
                <td className="px-6 py-4 text-sm">{project.date}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(project)}
                      className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            "Are you sure you want to delete this project?",
                          )
                        ) {
                          deleteProject(project.id!);
                        }
                      }}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {projects.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No projects found. Click &quot;Add Project&quot; to get started.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-bold text-foreground">
                {editingProject ? "Edit Project" : "Add New Project"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">
                    Project Title
                  </label>
                  <input
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="e.g. Paycort"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">
                    Year
                  </label>
                  <input
                    required
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="e.g. 2025"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Live Link
                </label>
                <input
                  required
                  type="url"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Tech Stack
                </label>
                <input
                  required
                  value={formData.tech}
                  onChange={(e) =>
                    setFormData({ ...formData, tech: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="e.g. Next.js, Firebase, TypeScript"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                  placeholder="Brief project summary..."
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm font-medium"
                >
                  <Save size={18} />
                  {editingProject ? "Save Changes" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}