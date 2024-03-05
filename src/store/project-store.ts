import { ProjectResponse } from '@/models/response/project-response-model'
import { create } from 'zustand'

interface ProjectState {
    projects: ProjectResponse[]
    set: (projects: ProjectResponse[]) => void
    add: (project: ProjectResponse) => void
    delete: (projectId: string) => void
}

export const useProjectStore = create<ProjectState>((set) => ({
    projects: [],
    set: (projects: ProjectResponse[]) => set((state) => ({ projects: projects })),
    add: (project: ProjectResponse) => set((state) => ({ projects: [project, ...state.projects] })),
    delete: (projectId: string) => set((state) => ({ projects: state.projects.filter(p => p.id !== projectId) })),
}));