import React from 'react';
import { Panel } from 'reactflow';

const EditBox = ({data, changeData}) => {


    return (
    <Panel>
        <div>
            {Object.entries(data).map(([key, value]) => 
                key !== "id" && <div key={String(key) + String(data["id"])} >
                    <label>{key}</label>
                    {key != "" ? <input value={value} onInput={e => changeData(data.id, key, e.target.value)}></input>: <textarea value={value} onInput={e => changeData(data.id, key, e.target.value)}></textarea> }    
                </div>
            )}
            <div>
                {data[""] ? null : <button onClick={e => changeData(data.id, "", "")} >Add extra notes</button> }
            </div>
        </div>
    </Panel>)
}
export default EditBox