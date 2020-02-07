import React from "react";
import clsx from "clsx";
import {createUseStyles} from "react-jss";
import {SectionInputProps} from "../Section"
import Stick from "../Icons/Stick";
import PressedArrow from "../Icons/PressedArrow";
import { HIDJoystickEvent, HIDButtonBitField, HIDButtonEvent } from "../WebIPCHID";
import ButtonX from "../Icons/ButtonX";
import { ActionContext, Action } from "../Contexts/Actions";
import { useHistory } from "react-router-dom";
import Cross from "../Icons/Cross";

const useStyles = createUseStyles({
    paddingArea:{
        display: "flex",
        height: "100%",
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    },
    joystickArea:{
        position: "relative",
        height: 280,
        width: 280,
        marginBottom: 30,
        outline: "none"
    },
    circle:{
        position: "absolute",
        height: "calc(100% - 40px);",
        width: "calc(100% - 40px);",
        margin: 20,
        border: "solid 1px #b0b0b0",
        borderRadius: 1000
    },
    circleTouched:{
        borderColor: "#2d4ef1"
    },
    verticalLine:{
        position: "absolute",
        left: "50%",
        height: "100%",
        border: "solid 1px #b0b0b0"
    },
    horizontalLine:{
        position: "absolute",
        top: "50%",
        width:"100%",
        border: "solid 1px #b0b0b0"
    },
    touchedLine:{
        borderColor: "#2d4ef1"
    },
    litleCircle:{
        display: "inline-block",
        height: 15,
        width: 15,
        backgroundColor: "#2d4ef1",
        borderRadius: 100
    },
    cross:{
        fill: "#2d4ef1",
    },
    littleCirclePointer:{
        position: "absolute",
        border: "solid 1px white"
    },
    crossPointer:{
        position: "absolute",
        top: "calc(50% - 12px)",
        left: "calc(50% - 12px)",
        stroke: "white",
        strokeWidth: 90
    },
    textBox:{
        alignSelf: "left"
    },
    headerText:{
        fontSize: 24,
        marginBottom: 25
    },
    listText:{
        marginBottom: 15
    },
    numListText:{
        fontSize: 30,
        paddingRight: 15
    },
    lastText:{
        marginTop: 20,
        fontSize: 24
    },
    separator:{
        width: 1015,
        height: 1,
        margin: "0 -40px",
        marginTop: 5,
        backgroundColor: "#cdcdcd"
    },
    invisible:{
        visibility: "hidden"
    }
});

export default function TestJoysticks(props:SectionInputProps){
    const classes = useStyles();
    const actionManager = React.useContext(ActionContext);
    const history = useHistory();
    const ref = React.useRef<HTMLDivElement>();
    const pointRef = React.useRef<HTMLDivElement>();
    const circleRef = React.useRef<HTMLDivElement>();

    const [lastHidJoystickEvent, setLastHidJoystickEvent] = React.useState<HIDJoystickEvent>();
    const [lastHidButtonEvent, setLastHidButtonEvent] = React.useState<HIDButtonEvent>();
    const [isInCenter, setIsInCenter] = React.useState(true);
    const [isInExtreme, setIsInExtreme] = React.useState(false);

    const handleBack = React.useCallback(() => {
        history.goBack();
    }, []);

    React.useEffect(() => {
        if(actionManager){
            actionManager.addActionMapOverlay(new Map([
                [HIDButtonBitField.B, new Action(HIDButtonBitField.B, "Atrás", handleBack)],
                [HIDButtonBitField.X, new Action(HIDButtonBitField.X, "Calibrar", ()=>{})],
                [HIDButtonBitField.Y, new Action(HIDButtonBitField.Y, "Restaurar la configuración original", ()=>{})]
            ]), ref.current);
            return () => {
                actionManager.removeActionMapOverlay(ref.current);
            }
        }
    })

    React.useEffect(()=>{
        if(ref.current && !ref.current["hooked"]){
            ref.current.addEventListener("hidJoystickEvent", (ev:CustomEvent<HIDJoystickEvent>) => setLastHidJoystickEvent(ev.detail));
            ref.current.addEventListener("hidButtonEvent", (ev:CustomEvent<HIDButtonEvent>) => setLastHidButtonEvent(ev.detail));
            ref.current.focus();
            ref.current["hooked"] = true;
        }
    }, [ref.current]);

    const pointCalcs = React.useMemo(() => {
        if(ref.current && pointRef.current && circleRef.current){
            return {
                halfX: (ref.current.getBoundingClientRect().width) / 2 - pointRef.current.getBoundingClientRect().width / 2,
                halfY: (ref.current.getBoundingClientRect().height) / 2 - pointRef.current.getBoundingClientRect().height / 2,
                halfInCircleX: (circleRef.current.getBoundingClientRect().width) / 2 + pointRef.current.getBoundingClientRect().width / 2,
                halfInCircleY: (circleRef.current.getBoundingClientRect().height) / 2 + pointRef.current.getBoundingClientRect().width / 2,
            };
        }else{
            return {halfX: 0, halfY: 0, halfInCircleX: 0, halfInCircleY: 0};
        }
    }, [ref.current, pointRef.current, circleRef.current])

    React.useEffect(() => {
        if(pointRef.current){
            if(lastHidJoystickEvent && pointRef.current && lastHidJoystickEvent.leftJoystick){
                let axisX = lastHidJoystickEvent.axisX;
                let axisY = lastHidJoystickEvent.axisY;
                const radio = Math.hypot(axisX, axisY);
                if(radio > 1.0 || Math.abs(axisX) === 1.0 || Math.abs(axisY) === 1.0){
                    //Overload
                    setIsInExtreme(true);
                    setIsInCenter(false);
                    const angle = Math.abs(Math.atan(axisX / axisY));
                    axisX = Math.sin(angle) * Math.sign(axisX);
                    axisY = Math.cos(angle) * Math.sign(axisY);
                }else if(radio === 0.0){
                    setIsInExtreme(false);
                    setIsInCenter(true)
                }else{
                    setIsInExtreme(false);
                    setIsInCenter(false);
                }
                pointRef.current.style.left = (pointCalcs.halfX + pointCalcs.halfInCircleX * axisX) + "px";
                pointRef.current.style.top = (pointCalcs.halfY + pointCalcs.halfInCircleY * axisY) + "px"; 
            }else if(!lastHidJoystickEvent){
                pointRef.current.style.left = pointCalcs.halfX + "px";
                pointRef.current.style.top = pointCalcs.halfY + "px";
            }
        }
    }, [pointRef.current, lastHidJoystickEvent]);

    React.useEffect(() => {
        if(lastHidButtonEvent){
            if(lastHidButtonEvent.isButtonPressed(HIDButtonBitField.B)){
                handleBack();
            }else if(lastHidButtonEvent.isButtonPressed(HIDButtonBitField.X)){
                //handleCalibrate
            }
        }
    })

    return <div className={classes.paddingArea}>
        <div ref={ref} className={classes.joystickArea} tabIndex={-1}>
            <div ref={circleRef} className={clsx(classes.circle, isInExtreme && classes.circleTouched)}/>
            <div className={clsx(classes.verticalLine, isInCenter && classes.touchedLine)}/>
            <div className={clsx(classes.horizontalLine, isInCenter && classes.touchedLine)}/>
            <div ref={pointRef} className={clsx(classes.litleCircle, classes.littleCirclePointer, isInCenter && classes.invisible)}/>
            <Cross className={clsx(classes.cross, classes.crossPointer, !isInCenter && classes.invisible)}/>
        </div>
        <div className={classes.textBox}>
            <div className={classes.headerText}>Comprueba los siguientes puntos:</div>
            <div className={classes.listText}><span className={classes.numListText}>1.</span>Que <Cross size={14} className={classes.cross}/> sustituye a <div className={classes.litleCircle}/> cuando no se mueve la palanca.</div>
            <div className={classes.listText}><span className={classes.numListText}>2.</span>Que el circulo cambia de color cuando el punto sale de él.</div>
            <div className={classes.separator}/>
            <div className={classes.lastText}>Si la palanca no funciona correctamente pulsa <ButtonX variant="unfilled"/> para recalibrarla.</div>    
        </div>
    </div>
}

