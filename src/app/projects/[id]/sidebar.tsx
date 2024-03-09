import { useState, useEffect } from "react";
import { Tabs, Tab } from "@nextui-org/react";
import VertexForm from "./vertex-form";
import EdgeForm from "./edge-form";
import { useGraphStore } from "@/store/graph-store";

export default function Sidebar({ projectId }: { projectId: string }) {
    const [tab, setTab] = useState<string>('vertex');

    const { selectedVertex, selectedEdge } = useGraphStore()

    useEffect(() => {
      if (selectedVertex !== null) {
        setTab('vertex')
      }
    }, [selectedVertex])

    useEffect(() => {
      if (selectedEdge !== null) {
        setTab('edge')
      }
    }, [selectedEdge])
    

    return (
        <div className="dark:dark flex w-full h-full flex-col">
          <Tabs aria-label="Options" selectedKey={ tab } onSelectionChange={(key) => setTab(key.toString())}>
            <Tab key="vertex" title="Vertex" className="flex flex-col items-center h-full">
                <VertexForm projectId={projectId} />
            </Tab>
            <Tab key="edge" title="Edge" className="flex flex-col items-center h-full">
                <EdgeForm projectId={projectId}  />
            </Tab>
          </Tabs>
        </div>  
      );
}