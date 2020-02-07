import React from "react";
import {createUseStyles} from "react-jss"
import {useHistory} from "react-router-dom";
import {Screen, ScreenOutputProps} from "../Screen";
import Button from "../Controls/Button"
import { HIDButtonEvent, HIDButtonBitField } from "../WebIPCHID";
import ButtonA from "../Icons/ButtonA";
import { IconCommonProps, IconButtonMap } from "../Icon";
import Screenshot from "../Icons/Screenshot";
import Home from "../Icons/Home";

const useStyles = createUseStyles({
    eventLayer:{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    },
    subTitle:{
        fontSize: 40
    },
    buttonIcon:{
        fill: "#394dee",
        margin: "0 20px"
    },
    buttonTestArea:{
        height: 40,
        width: 800,
        borderBottom: "solid 3px #394dee",
        paddingBottom: 10,
        marginTop: 90,
        marginBottom: 15,
        outline: "none"
    },
    noteText:{
        width: 640,
        fontSize: 16,
        textAlign: "center",
        lineHeight: "25px",
        color: "#7c7c7c"
    },
    exitButton:{
        width: 355,
        fontSize: 22,
        marginTop: 60,
        marginBottom: 40
    }
});

export default function TestButtons(){
    const classes = useStyles();
    const history = useHistory();
    const buttonAreaRef = React.useRef<HTMLDivElement>();

    const [lastHIDButtonEvent, setLastHIDButtonEvent] = React.useState<HIDButtonEvent>(null);
    const [lastBlurEvent, setLastBlurEvent] = React.useState<FocusEvent>(undefined);
    const [buttonLog, setButtonLog] = React.useState<React.FunctionComponent<IconCommonProps>[]>([]);
    const [timeoutHandle, setTimeoutHandle] = React.useState<number>(null);

    const handleExit = React.useCallback(() => {

        console.log("BlurOut");
        //Doesn't matter if you aniquilate the handle, probably a onblur will be tiggered anyways
        setLastBlurEvent(null);
        history.goBack();
    }, []);

    React.useEffect(() => {
        if(lastHIDButtonEvent){
            if(lastHIDButtonEvent.pressed){
                setButtonLog((buttonLog) => {
                    const ret = buttonLog.slice();
                    for(const button of lastHIDButtonEvent.getListOfButtons()){
                        ret.push(IconButtonMap.get(button));
                    }

                    while(ret.length > 10) ret.shift();
                    return ret
                });
                if(timeoutHandle == null) setTimeoutHandle(window.setTimeout(handleExit, 500))
            }else{
                clearTimeout(timeoutHandle);
                setTimeoutHandle(null);
            }
              
        }
    }, [lastHIDButtonEvent]);

    React.useEffect(() => {
        if(lastBlurEvent && lastBlurEvent !== null){
            buttonAreaRef.current.focus();
        }
    }, [lastBlurEvent])

    React.useEffect(() => {
        if(buttonAreaRef.current && !buttonAreaRef["tbHooked"]){
            buttonAreaRef.current.addEventListener("blur", (ev) => setLastBlurEvent((lastEv) => lastEv !== null ? ev : lastEv));
            buttonAreaRef.current["tbHooked"] = true;
            buttonAreaRef.current.focus();
        }
    }, [buttonAreaRef.current]);
    

    return <Screen useFocusManager={false}>
        {(props:ScreenOutputProps) => {
            React.useEffect(() => {
                if(props.reference.current){
                    if(!props.reference.current["tbHooked"]){
                        props.reference.current.addEventListener("hidButtonEvent", (ev:CustomEvent<HIDButtonEvent>) => {
                            setLastHIDButtonEvent(ev.detail);
                        });
                        props.reference.current["tbHooked"] = true;
                    }
                }
            }, [props.reference.current])

            return <>
                <div ref={props.reference as React.RefObject<HTMLDivElement>} className={classes.eventLayer}>
                    <div className={classes.subTitle}>Aquí se mostrará lo que pulses.</div>
                    <div ref={buttonAreaRef} className={classes.buttonTestArea} tabIndex={-1}>
                        {buttonLog.map((item, index) => React.createElement(item, {key: index, className: classes.buttonIcon, size: 40}))}
                    </div>
                    <div className={classes.noteText}>No es posible comprobar el botón HOME(<Home size={16}/>), el botón de captura(<Screenshot size={16}/>), el botón POWER, los botones de volumen ni el botón SYNC.</div>
                    <Button className={classes.exitButton} onActivate={handleExit}>Salir</Button>
                    <div>Mantén pulsado cualquier botón para finalizar la prueba</div>
                </div>
            </>
            }
        }
    </Screen>
}