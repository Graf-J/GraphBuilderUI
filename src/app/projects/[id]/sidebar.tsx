import { Tabs, Tab } from "@nextui-org/react";
import VertexForm from "./vertex-form";
import EdgeForm from "./edge-form";

export default function Sidebar({ projectId, vertices, graphCenter, selectedTab, selectedEdge, selectedVertex, handleTabClick, handleCreateVertex, handleUpdateVertex, handleDeleteVertex, handleCreateEdge, handleUpdateEdge, handleDeleteEdge }: any) {
    

    return (
        <div className="dark:dark flex w-full h-full flex-col">
          <Tabs aria-label="Options" selectedKey={selectedTab} onSelectionChange={(key) => handleTabClick(key)}>
            <Tab key="vertex" title="Vertex" className="flex flex-col items-center h-full">
                <VertexForm projectId={projectId} graphCenter={graphCenter} selectedVertex={selectedVertex} handleCreateVertex={handleCreateVertex} handleUpdateVertex={handleUpdateVertex} handleDeleteVertex={handleDeleteVertex} />
            </Tab>
            <Tab key="edge" title="Edge" className="flex flex-col items-center h-full">
                <EdgeForm projectId={projectId} vertices={vertices} selectedEdge={selectedEdge} handleCreateEdge={handleCreateEdge} handleUpdateEdge={handleUpdateEdge} handleDeleteEdge={handleDeleteEdge} />
            </Tab>
          </Tabs>
        </div>  
      );
}