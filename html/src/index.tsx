import React from "react";
import ReactDOM from "react-dom";

import App from './App';
import {HIDSubmoduleSimulation} from "./WebIPCHID"

const renderElem = document.createElement("div");
document.body.appendChild(renderElem);
document.body.style.margin = "0";
document.body.style.padding = "0";

document.write('<script data-consolejs-channel="f8f07e01-3d29-cfe5-ec8b-55d8a11e2c9f" src="https://remotejs.com/agent/agent.js"></script>');

let globalStyle = document.createElement("style")
globalStyle.innerText = "\
::-webkit-scrollbar {\
    width: 0px;\
    background: transparent;\
}";
document.head.appendChild(globalStyle);

//window.webipc.gamepad.simulate();

if(window.nx){
    window.nx.footer.setAssign("X", "", ()=>{},{se:""});
    
}else{
    let nonNXStyle = document.createElement("style")
    nonNXStyle.innerText = "\
    @font-face {\
        font-family: SwitchUI;\
        src: url(SwitchUI.ttf);\
    }\
    * {\
        font-family: SwitchUI;\
        font-size: 20px;\
    }";
    document.head.appendChild(nonNXStyle);
}

window.webIPC ={
    hid: new HIDSubmoduleSimulation(),
};
window.webIPC.hid.activateHIDEvents();

ReactDOM.render(<App />, renderElem);