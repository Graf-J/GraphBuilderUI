import { create } from 'zustand'
import { Project } from '@/models/application/project'

interface ProjectState {
    projects: Project[] | null
    set: (projects: Project[]) => void
    add: (project: Project) => void
    delete: (projectId: string) => void
}

export const useProjectStore = create<ProjectState>((set) => ({
    projects: null,
    set: (projects: Project[]) => set((state) => ({ projects: projects })),
    add: (project: Project) => set((state) => ({ projects: state.projects ? [project, ...state.projects] : [project] })),
    delete: (projectId: string) => set((state) => ({ projects: state.projects ? state.projects.filter((p) => p.id !== projectId) : null })),
}));