import React, { useState, useRef, useCallback } from 'react';
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
import { saveAs } from 'file-saver';

import 'reactflow/dist/style.css';
import ExportButton from './download';


// there are duplicates in data
const raw_data = `{"nodes":[{"id":"outfall_0","node_id":"SH66330602","outfall":true,"position":{"x":266091.6820842675,"y":333629.47913102445}},{"id":"outfall_1","node_id":"SH65333008","outfall":true,"position":{"x":265371.4309478405,"y":333006.0624781659}},{"id":"outfall_2","node_id":"SH67358406","outfall":true,"position":{"x":267856.4240544361,"y":335401.1362372942}},{"id":"FM500","node_id":"SH67358406","outfall":false,"position":{"x":267856.4240544361,"y":335401.1362372942}},{"id":"outfall_3","node_id":"SH68337711","outfall":true,"position":{"x":268742.7728982904,"y":333779.2984034574}},{"id":"FM10","node_id":"SH68338501","outfall":false,"position":{"x":268800.0999999996,"y":333539.7}},{"id":"FM09","node_id":"SH68337403","outfall":false,"position":{"x":268725.9000000004,"y":333444.6}},{"id":"FM08","node_id":"SH68337301","outfall":false,"position":{"x":268745.0999999996,"y":333333.5}},{"id":"outfall_4","node_id":"SH68340109","outfall":true,"position":{"x":268078.88711994817,"y":334126.7538701798}},{"id":"FM600","node_id":"SH67348604","outfall":false,"position":{"x":267822.4855981748,"y":334636.1403372658}},{"id":"outfall_5","node_id":"SH67341603","outfall":true,"position":{"x":267188.65663494973,"y":334633.7408306621}},{"id":"outfall_6","node_id":"SW005_Outfall","outfall":true,"position":{"x":267317.448,"y":333536.291}},{"id":"outfall_7","node_id":"SW009_Outfall","outfall":true,"position":{"x":267156.150954817,"y":333469.9713041278}},{"id":"outfall_8","node_id":"SW003_Outfall","outfall":true,"position":{"x":267317.47,"y":333536.269}},{"id":"FM05","node_id":"SH66337001","outfall":false,"position":{"x":266756.5999999996,"y":333074.6}},{"id":"outfall_9","node_id":"SW010_Outfall","outfall":true,"position":{"x":267313.65508016734,"y":332644.46121007483}},{"id":"outfall_10","node_id":"WWTP_storm tank outfall","outfall":true,"position":{"x":267845.73104527657,"y":333776.4775654332}},{"id":"FM01","node_id":"SH67338501","outfall":false,"position":{"x":267842.619,"y":333515.23}},{"id":"FM04","node_id":"SH68330402","outfall":false,"position":{"x":268014.7999999998,"y":333464.2}},{"id":"FM05","node_id":"SH66337001","outfall":false,"position":{"x":266756.5999999996,"y":333074.6}},{"id":"FM02","node_id":"SH67338503","outfall":false,"position":{"x":267885.2000000002,"y":333509.6}},{"id":"FM10","node_id":"SH68338501","outfall":false,"position":{"x":268800.0999999996,"y":333539.7}},{"id":"FM600","node_id":"SH67348604","outfall":false,"position":{"x":267822.4855981748,"y":334636.1403372658}},{"id":"FM05","node_id":"SH66337001","outfall":false,"position":{"x":266756.5999999996,"y":333074.6}},{"id":"outfall_11","node_id":"WWTP_outfall","outfall":true,"position":{"x":267894.15414659504,"y":333724.0479252192}},{"id":"FM01","node_id":"SH67338501","outfall":false,"position":{"x":267842.619,"y":333515.23}},{"id":"FM02","node_id":"SH67338503","outfall":false,"position":{"x":267885.2000000002,"y":333509.6}},{"id":"FM600","node_id":"SH67348604","outfall":false,"position":{"x":267822.4855981748,"y":334636.1403372658}},{"id":"FM05","node_id":"SH66337001","outfall":false,"position":{"x":266756.5999999996,"y":333074.6}}],"edges":[{"id":"FM500_outfall_2","source":"FM500","target":"outfall_2"},{"id":"FM10_outfall_3","source":"FM10","target":"outfall_3"},{"id":"FM09_FM10","source":"FM09","target":"FM10"},{"id":"FM08_FM10","source":"FM08","target":"FM10"},{"id":"FM600_outfall_4","source":"FM600","target":"outfall_4"},{"id":"FM05_outfall_8","source":"FM05","target":"outfall_8"},{"id":"FM01_outfall_10","source":"FM01","target":"outfall_10"},{"id":"FM04_FM01","source":"FM04","target":"FM01"},{"id":"FM05_FM01","source":"FM05","target":"FM01"},{"id":"FM02_outfall_10","source":"FM02","target":"outfall_10"},{"id":"FM10_FM02","source":"FM10","target":"FM02"},{"id":"FM600_outfall_10","source":"FM600","target":"outfall_10"},{"id":"FM05_outfall_10","source":"FM05","target":"outfall_10"},{"id":"FM01_outfall_11","source":"FM01","target":"outfall_11"},{"id":"FM02_outfall_11","source":"FM02","target":"outfall_11"},{"id":"FM600_outfall_11","source":"FM600","target":"outfall_11"},{"id":"FM05_outfall_11","source":"FM05","target":"outfall_11"},  {"id":"FM09_FM02","source":"FM09","target":"FM02"}]}`
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

console.log(initialNodes)

var initialEdges = data.edges.map(item => {
    item.type = 'smoothstep'; 
    item.markerEnd = {
        type: MarkerType.Arrow,
      }
    item.animated = true
    return item
})

// remove outfalls
// initialNodes = initialNodes.filter(item => (!item.id.includes("outfall")))
// initialEdges = initialEdges.filter(item => (!item.target.includes("outfall") || item.source.includes("outfall") ))


// remove isolated nodes
var list_of_connected_nodes = []
initialEdges.forEach(item => {
    if(!list_of_connected_nodes.includes(item.source)){list_of_connected_nodes.push(item.source)}; 
    if(!list_of_connected_nodes.includes(item.target)){list_of_connected_nodes.push(item.target)}; 
})
initialNodes = initialNodes.filter(item => list_of_connected_nodes.includes(item.id))


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

var seen_nodes = []
// var final_layer  = [...layers]
for(var i = layers.length - 1; i > -1; i-- ){
    let layer = layers[i] 
    for(var j = 0; j < layer.length; j++){
        if(seen_nodes.includes(layer[j])){
            layers[i].splice(j,1)
        }else{
            seen_nodes.push(layer[j])
        }
    }
}

console.log(initialNodes)
console.log(layers)

for(var i = 0; i < layers.length; i++){
    let layer = layers[i]
    for(var j = 0; j < layer.length; j++){
        let index = initialNodes.findIndex(item => item.id === layer[j])
        console.log(index)
        initialNodes[index].position.x = (i*250) + (j*25) + 100
        initialNodes[index].position.y = (j*100) + (i%2 ===0 ? 100 : 150)
    }
}

console.log(initialNodes)
// const initialNodes = [
//     { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
//     { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
//   ];

// const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

export default function Schemtics() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onLoad = (reactFlowInstance) => {
    reactFlowInstance.fitView();
  };

    return (
        <div>
            <div id="diagram" style={{ width: '100vw', height: '100vh' }}>
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
                </ReactFlow>
                </ReactFlowProvider>
            </div>
        </div>
    );
}