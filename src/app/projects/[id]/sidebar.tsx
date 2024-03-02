import { Tabs, Tab } from "@nextui-org/react";
import VertexForm from "./vertex-form";

interface VertexFormValues {
    name: string;
    radius: number;
    properties: any[];
}

export default function Sidebar({ projectId, graphCenter, selectedTab, selectedEdge, selectedVertex, handleTabClick, handleCreateVertex, handleUpdateVertex, handleDeleteVertex }: any) {
    

    return (
        <div className="dark:dark flex w-full h-full flex-col">
          <Tabs aria-label="Options" selectedKey={selectedTab} onSelectionChange={(key) => handleTabClick(key)}>
            <Tab key="vertex" title="Vertex" className="flex flex-col items-center h-full">
                <VertexForm projectId={projectId} graphCenter={graphCenter} selectedVertex={selectedVertex} handleCreateVertex={handleCreateVertex} handleUpdateVertex={handleUpdateVertex} handleDeleteVertex={handleDeleteVertex} />
            </Tab>
            <Tab key="edge" title="Edge">
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </Tab>
          </Tabs>
        </div>  
      );
}