import React from "react"
import {createUseStyles} from "react-jss"
import CommandButton from "./CommandButton"
import ButtonA from "./Icons/ButtonA";
import ButtonX from "./Icons/ButtonX";
import {ActionContext, ActionMap, Action} from "./Contexts/Actions"
import {HIDButtonBitField} from "./WebIPCHID"

const useStyles = createUseStyles({
    commandBar: {
        boxSizing: "border-box",
        position: "absolute",
        width: "100%",
        height: "70px",
        bottom: "0",
        padding: "0 30px"
    },
    separator: {
        width: "100%",
        height: "1px",
        backgroundColor: "black"
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
    
    const iconButtonMap = React.useMemo(() => new Map<HIDButtonBitField, React.FunctionComponent>([
        [HIDButtonBitField.A, ButtonA],
        [HIDButtonBitField.X, ButtonX]
    ]), []);

    return <div className={classes.commandBar}>
        <div className={classes.separator}/>
        {actions.map((action)=>
            <CommandButton iconButton={React.createElement(iconButtonMap.get(action.assignedButton))} key={action.assignedButton} text={action.label}/>)}
    </div>
}