import React from "react"
import {createUseStyles} from "react-jss"
import CommandButton from "./CommandButton"
import ButtonA from "./Icons/ButtonA";
import ButtonX from "./Icons/ButtonX";
import {ActionContext, ActionMap, Action} from "./Contexts/Actions"
import {HIDButtonBitField} from "./WebIPCHID"
import { IconCommonProps, IconButtonMap } from "./Icon";

const useStyles = createUseStyles({
    commandBar: {
        boxSizing: "border-box",
        width: "100%",
        height: "70px",
        padding: "0 30px"
    },
    separator: {
        width: "100%",
        height: "1px",
        backgroundColor: "black"
    },
    commandBarBox: {
        display: "flex",
        flexDirection: "row-reverse",
        height: "100%"
    }
});

export default function CommandBar(){
    const classes = useStyles();
    const [actionMap, setActionMap] = React.useState(new Map());
    
    const handleActionMapChange = React.useCallback((actionMap:ActionMap) => {
        console.log("NewMap");
        console.log(actionMap);
        setActionMap(actionMap);
    }, []);

    const actionManager = React.useContext(ActionContext);

    React.useEffect(()=>{
        actionManager.addListener(handleActionMapChange);
        return ()=>actionManager.removeHandler(handleActionMapChange);
    }, []);


    const actions = React.useMemo(()=>{
        let res = new Array<Action>();
        for(const [button, action] of actionMap){
            action.assignedButton = button;
            res.push(action);
        }
        console.log(res);
        return res;
    }, [actionMap]);

    return <div className={classes.commandBar}>
        <div className={classes.separator}/>
        <div className={classes.commandBarBox}>
            {actions.map((action)=>
                <CommandButton iconButton={React.createElement(IconButtonMap.get(action.assignedButton))}
                            key={action.assignedButton} text={action.label} callback={action.callback}/>)}
        </div>
    </div>
}