import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

export default memo(({ data, isConnectable }) => {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={isConnectable}
      />
        <div>
            {Object.entries(data).map(([key, value]) => 
                key !== "id" && 
                <div key = {String(key) + String(data["id"])}>             
                    <label><strong>{key}</strong></label> &nbsp;
                    <label className="display-linebreak">{value}</label>    
                </div>
            )}
        </div>
      <Handle
        type="source"
        position={Position.Right}
        // style={{ top: 10, background: '#555' }}
        isConnectable={isConnectable}
      />
      {/* <Handle
        type="source"
        position={Position.Right}
        id="b"
        style={{ bottom: 10, top: 'auto', background: '#555' }}
        isConnectable={isConnectable}
      /> */}
    </>
  );
});
