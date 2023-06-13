import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  MarkerType,
} from 'reactflow';

import 'reactflow/dist/style.css';
import DownloadButton from './download';

var dagre = require("dagre");
var g = new dagre.graphlib.Graph();
g.setGraph({});
g.setDefaultEdgeLabel(function() { return {}; });

// Choose File button
function JsonFileInput({setRawData}) {
  const [fileContent, setFileContent] = useState("");

  function handleFileSelect(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
        setRawData(reader.result);
    };
    reader.readAsText(file);
  }

  return (
    <div>
      <input type="file" onChange={handleFileSelect} />
      {fileContent && <p>File content: {fileContent}</p>}
    </div>
  );
}



// there are duplicates in data => To be sorted in ruby script

const processData = (raw_data) => { 

    if(!raw_data){return [[], []]} 

    var data = JSON.parse(raw_data)

    const removeDuplicatesById = (arr) => {
        const uniqueValues = {};
        return arr.reduce((result, obj) => {
            if (!uniqueValues[obj.id]) {
                uniqueValues[obj.id] = true;
                result.push(obj);
            }
            return result;
        }, []);
    };

    data.nodes = removeDuplicatesById(data.nodes)

    const xmax = data.nodes.reduce((prev, current) => {
        return (prev.position.x > current.position.x) ? prev : current;
    }).position.x;

    const xmin = data.nodes.reduce((prev, current) => {
        return (prev.position.x < current.position.x) ? prev : current;
    }).position.x;

    const ymax = data.nodes.reduce((prev, current) => {
        return (prev.position.y > current.position.y) ? prev : current;
    }).position.y;

    const ymin = data.nodes.reduce((prev, current) => {
        return (prev.position.y < current.position.y) ? prev : current;
    }).position.y;

    var range = {xmax, xmin, ymax, ymin}

    console.log(range)

    var initialNodes = data.nodes.map(item => {
        item.data = {label: item.id}; 
        item.position.x = (item.position.x-xmin)/(xmax-xmin) * 1000 + 50;
        item.position.y = (item.position.y-ymin)/(ymax-ymin) * 700  + 50;
        item.deletable = true
        item.sourcePosition = 'right'
        item.targetPosition = 'left'
        return item;
    })

    //console.log(initialNodes)

    var initialEdges = data.edges.map(item => {
        item.type = 'smoothstep'; 
        item.markerEnd = {
            type: MarkerType.Arrow,
        }
        item.animated = true
        return item
    })

    // remove outfalls
    initialNodes = initialNodes.filter(item => (!item.id.includes("outfall")))
    initialEdges = initialEdges.filter(item => (!item.target.includes("outfall") || item.source.includes("outfall") ))


    // remove isolated nodes
    var list_of_connected_nodes = []
    initialEdges.forEach(item => {
        if(!list_of_connected_nodes.includes(item.source)){list_of_connected_nodes.push(item.source)}; 
        if(!list_of_connected_nodes.includes(item.target)){list_of_connected_nodes.push(item.target)}; 
    })
    initialNodes = initialNodes.filter(item => list_of_connected_nodes.includes(item.id))

    /*
    // working out layer structure
    var headNodeIds = [] 
    initialNodes.forEach(item => {
        for(let i = 0; i < initialEdges.length; i++ ){
        if(initialEdges[i].target === item.id){
            // console.log(item.id)
            break
        }else if(i === initialEdges.length - 1 && !headNodeIds.includes(item.id)){
            headNodeIds.push(item.id)
        }
        }
    }) 

    var working_layer = headNodeIds

    var layers = []
    var i = 0
    while (working_layer.length !== 0){
        let layer = working_layer
        layers.push(layer)
        let next_layer = []
        layer.forEach(node_id => {
            initialEdges.forEach(ed => {
                if(ed.source == node_id && !next_layer.includes(ed.target) ){
                    next_layer.push(ed.target)
                }
            })
        })
        working_layer = next_layer
    } 

    // removing nodes apperaing in multiple layers
    var seen_nodes = []
    var final_layers  = JSON.parse(JSON.stringify(layers))
    console.log(layers)
    for(var i = layers.length - 1; i > -1; i--){
        let layer = layers[i] 
        for(var j = 0; j < layer.length; j++){
            //console.log(seen_nodes, layer[j], layer, j)
            if(seen_nodes.includes(layer[j])){
                final_layers[i][j] = null
            }else{
                seen_nodes.push(layer[j])
            }
        }
        final_layers[i] = final_layers[i].filter(item => item !== null);
    }

    console.log(final_layers)

    for(var i = 0; i < final_layers.length; i++){
        let layer = final_layers[i]
        for(var j = 0; j < layer.length; j++){
            let index = initialNodes.findIndex(item => item.id === layer[j])
            initialNodes[index].position.x = (i*262.5) + (j*25) + 100
            // initialNodes[index].position.y = (j*100) + (i%2 ===0 ? 100 : 150)
            initialNodes[index].position.y = (j*100) + (i*50) + 100
            
        }
    }
    */

    // degre implementation
    initialNodes.forEach(item => g.setNode(item.id,    { label: item.id,  width: 100, height: 200 }))
    initialEdges.forEach(item => g.setEdge(item.source, item.target))
    dagre.layout(g);
    g.nodes().forEach(function(v) {
        console.log("Node " + v + ": " + JSON.stringify(g.node(v)));
    });

    g.edges().forEach(function(e) {
        console.log("Edge " + e.v + " -> " + e.w + ": " + JSON.stringify(g.edge(e)));
    });

    initialNodes = initialNodes.map(item => {
        item.position.y = g.node(item.id)["x"]
        item.position.x = g.node(item.id)["y"]
        return item
    })


    return [initialNodes, initialEdges]
}


export default function Schemtics() {

    const [raw_data, setRawData] = useState(null)

    const [initialNodes, initialEdges] = processData(raw_data)

    console.log(initialNodes, initialEdges)

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    useEffect(() => {
      setNodes(initialNodes)
      setEdges(initialEdges)
    }, [raw_data])
    

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const onLoad = (reactFlowInstance) => {
        reactFlowInstance.fitView();
    };

    return (
        <div>
            <div id="diagram" style={{ width: '100vw', height: '100vh' }}>
            <JsonFileInput setRawData={setRawData} />
            <ReactFlowProvider>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    //onConnect={onConnect}
                    
                >
                    <Controls />
                    <MiniMap />
                    <Background variant="dots" gap={12} size={1} />
                    <DownloadButton />
                </ReactFlow>
                </ReactFlowProvider>
            </div>
        </div>
    );
}