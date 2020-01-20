import React from "react";
import ReactDOM from "react-dom";

import App from './App';

const renderElem = document.createElement("div");
document.body.appendChild(renderElem);
document.body.style.margin = "0";
document.body.style.padding = "0";

let globalStyle = document.createElement("style")
globalStyle.innerText = "\
@font-face {\
    font-family: SwitchUI;\
    src: url(SwitchUI.ttf);\
}\
* {\
    font-family: SwitchUI;\
}"
document.head.appendChild(globalStyle);

ReactDOM.render(<App />, renderElem);