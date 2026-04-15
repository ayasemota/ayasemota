"use client";

import { useState } from "react";
import { Plus, Briefcase, ExternalLink, Edit2, Trash2, ArrowUp, ArrowDown, Save, X } from "lucide-react";
import { useProjects, Project } from "@/hooks/useProjects";

export default function ProjectsSection() {
  const { projects, loading, addProject, updateProject, deleteProject, reorderProject } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Briefcase className="text-primary" />
          Portfolio Projects
        </h2>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm font-medium"
        >
          <Plus size={20} />
          Add Project
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="px-6 py-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Order</th>
              <th className="px-6 py-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Project</th>
              <th className="px-6 py-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tech Stack</th>
              <th className="px-6 py-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Year</th>
              <th className="px-6 py-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {projects.map((project, index) => (
              <tr key={project.id} className="hover:bg-muted/30 transition-colors">
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
                    <div className="font-bold text-foreground">{project.title}</div>
                    <a 
                      href={project.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5"
                    >
                      {new URL(project.link).hostname} <ExternalLink size={10} />
                    </a>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{project.tech}</td>
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
                        if (confirm("Are you sure you want to delete this project?")) {
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
                  <label className="text-xs font-bold uppercase text-muted-foreground">Project Title</label>
                  <input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="e.g. Paycort"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Year</label>
                  <input
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="e.g. 2025"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Live Link</label>
                <input
                  required
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Tech Stack</label>
                <input
                  required
                  value={formData.tech}
                  onChange={(e) => setFormData({ ...formData, tech: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="e.g. Next.js, Firebase, TypeScript"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
