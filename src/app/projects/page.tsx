import ProjectCard from '@/components/custom/project-card';
import { Project } from '@/models/project-model';

async function getData(): Promise<Project[]> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/projects`, { cache: 'no-store' })
    
    if (!res.ok) {
        throw new Error('Failed to fetch data')
    }
    
    return res.json()
}

export default async function Page() {
    const projects = await getData();

    return(
        <div className="flex flex-wrap h-screen bg-gray-200 dark:bg-gray-800 overflow-auto">
            { projects.map((project: Project) => (
                <ProjectCard key={project.id}  project={project}/>
            ))}
        </div>
    );
}