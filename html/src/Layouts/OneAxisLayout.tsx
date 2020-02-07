import React from "react";
import {createUseStyles} from "react-jss";
import {NavigationContext, NavigationProps} from "../Contexts/Navigation"
import {Layout, LayoutOutputProps} from "../Layout"
import { FocusContext } from "../Contexts/FocusOld";
import { AnimationContext } from "../Contexts/Animation";
import { HIDJoystickEvent, HIDButtonEvent, HIDButtonBitField } from "../WebIPCHID";

const useStyles = createUseStyles({
    scrollArea:{
        position: "relative",
        height: "100%",
        overflowX: "hidden",
        overflowY: "scroll",
        scrollbarWidth: "none",
        //scrollBehavior: "smooth",
        margin: "-15px -10px",
        padding: "15px 10px",
    },
    scroll:{
        position: "absolute",
        right: 0,
        height: 100,
        width: 4,
        borderRadius: 2,
        backgroundColor: "#c5c5c5"
    }
});

export default function OneAxisLayout({children, horizontal=false}){
    const parentNavProps = React.useContext(NavigationContext);
    const animationManager = React.useContext(AnimationContext);
    const classes = useStyles();

    return <Layout<number> initialFocusIndex={0}>
        {(props:LayoutOutputProps<number>) => {
            const ref = React.useRef<HTMLDivElement>();
            const scrollRef = React.useRef<HTMLDivElement>();
            const scrollTimeHandleRef = React.useRef<number>(null);
            const [mayExecScroll, setMayExecScroll] = React.useState(false);
            const [forwardsPressed, setForwardsPressed] = React.useState(false);
            const [backwardsPressed, setBackwardsPressed] = React.useState(false);
            const [isAlreadyBounced, setIsAlreadyBounced] = React.useState(false);
            const [timeSinceFirstNavigation, setTimeOnFirstNavigation] = React.useState(0);
            const [timeOnNextNavigation, setTimeOnNextNavigation] = React.useState(1000);
            const [isScrollMoving, setIsScrollMoving] = React.useState(false);
            const [scrollMoving, setScrollMoving] = React.useState(0);
            const [isScrollCausedByJoystick, setIsScrollCausedByJoystick] = React.useState(false);
            const [lastHidButtonEvent, setLastHidButtonEvent] = React.useState<HIDButtonEvent>();
            const [lastHidJoystickEvent, setLastHidJoystickEvent] = React.useState<HIDJoystickEvent>();

            React.useEffect(() => {
                if(scrollTimeHandleRef.current === null){
                    scrollTimeHandleRef.current = window.setInterval(() => setMayExecScroll(true), 1000/60);
                }
                return () => {
                    clearInterval(scrollTimeHandleRef.current);
                }
            }, []);
            
            const scrollData = React.useMemo(() => {
                if(scrollRef.current && ref.current){
                    const areaHeight = ref.current.getBoundingClientRect().height;
                    const avaiableScrollHeight = areaHeight - 20;
                    const pageHeight = ref.current.scrollHeight;
                    const scrollHeight = areaHeight / pageHeight * avaiableScrollHeight;
                    const scrollTop = ref.current.scrollTop / pageHeight * avaiableScrollHeight;
                    return {areaHeight, avaiableScrollHeight, pageHeight, scrollHeight, scrollTop};
                }else{
                    return {areaHeight: 0, avaiableScrollHeight: 0, pageHeight: 0, scrollHeight: 0, scrollTop: 0};
                }
            }, [scrollRef.current, ref.current])

            const navigate = React.useCallback((forward:boolean) => {
                if(!props.isAnyFocusable()) {
                    setIsScrollMoving(true);
                    return;
                }
                let newFocusedRow = props.focusedIndex;
                do{
                    newFocusedRow += forward ? 1 : -1;
                    if((forward && newFocusedRow >= React.Children.count(children)) ||
                       (!forward && newFocusedRow < 0)) {
                        if(!isAlreadyBounced){
                            const animName = forward ?
                                (horizontal ? "bounceRight" : "bounceDown") :
                                (horizontal ? "bounceLeft" : "bounceUp");
                            animationManager.execAnimation(animName);
                            setIsAlreadyBounced(true);
                        }
                        return;
                    }
                }while(!props.isFocusable(newFocusedRow));
                
                const nextElem = props.getElementForChild(newFocusedRow);
                if((forward && ref.current.scrollTop + ref.current.clientHeight > nextElem.offsetTop) ||
                   (!forward && ref.current.scrollTop < nextElem.offsetTop)){
                    props.getFocusPropsForChild(newFocusedRow).grabFocus();
                }else{
                    setIsScrollMoving(true);
                }
            }, [props]);
            
            React.useEffect(() => {
                if(mayExecScroll){
                    if(forwardsPressed || backwardsPressed){
                        console.log(scrollMoving);
                        if(timeSinceFirstNavigation === 0){
                            navigate(forwardsPressed);
                            setTimeOnNextNavigation(1000);
                        }else if(timeSinceFirstNavigation > timeOnNextNavigation){
                            navigate(forwardsPressed);
                            setIsScrollMoving(true);
                            setTimeOnNextNavigation(timeSinceFirstNavigation + Math.round(2000 / Math.abs(scrollMoving)));
                        }
                        setTimeOnFirstNavigation(timeSinceFirstNavigation + 60);
                    }else{
                        setScrollMoving(0);
                        setIsScrollMoving(false);
                        setTimeOnFirstNavigation(0);
                        setIsAlreadyBounced(false);
                    }

                    if(isScrollMoving){
                        ref.current.scrollBy({top: scrollMoving});
                        const scrollTop = ref.current.scrollTop / scrollData.pageHeight * scrollData.avaiableScrollHeight;
                        scrollRef.current.style.top = ref.current.scrollTop + scrollTop + "px";
                        scrollRef.current.style.height = scrollData.scrollHeight  + "px";
                    }

                    setMayExecScroll(false);
                }
            }, [mayExecScroll, scrollMoving]);

            const handleNavigateBackwards = () => {
                //setNavigateBackwards(true);
                
            };

            const handleNavigateForwards = () => {
                //setNavigateForwards(true);
            }

            React.useEffect(() => {
                if(lastHidButtonEvent){
                    console.log(lastHidButtonEvent);
                    if(lastHidButtonEvent.isButtonPresent(HIDButtonBitField.UpPad) && !horizontal){
                        setBackwardsPressed(lastHidButtonEvent.pressed);
                        setScrollMoving(-20);
                    }
                    if(lastHidButtonEvent.isButtonPresent(HIDButtonBitField.DownPad) && !horizontal){
                        setForwardsPressed(lastHidButtonEvent.pressed);
                        setScrollMoving(20);
                    }
                    if(lastHidButtonEvent.isButtonPresent(HIDButtonBitField.LeftPad) && horizontal){
                        setBackwardsPressed(lastHidButtonEvent.pressed);
                    }
                    if(lastHidButtonEvent.isButtonPresent(HIDButtonBitField.RightPad) && horizontal){
                        setForwardsPressed(lastHidButtonEvent.pressed);
                    }
                }
            }, [lastHidButtonEvent]);

            React.useEffect(() => {
                if(lastHidJoystickEvent){
                    if(isScrollCausedByJoystick){
                        if(forwardsPressed && lastHidJoystickEvent.axisY < 0.1){
                            setForwardsPressed(false);
                            setIsScrollCausedByJoystick(false);
                        }else if(backwardsPressed && lastHidJoystickEvent.axisY > -0.1){
                            setBackwardsPressed(false);
                            setIsScrollCausedByJoystick(false);
                        }else{
                            setScrollMoving(lastHidJoystickEvent.axisY * 20);
                        }
                    }else{
                        if(lastHidJoystickEvent.axisY > 0.1){
                            setForwardsPressed(true);
                            setIsScrollCausedByJoystick(true);
                        }else if(lastHidJoystickEvent.axisY < -0.1){
                            setBackwardsPressed(true);
                            setIsScrollCausedByJoystick(true);
                        }
                    }
                }
            }, [lastHidJoystickEvent]);

            React.useEffect(() =>  {
                if(ref.current && !ref.current["hooked"]){
                    ref.current.addEventListener("hidJoystickEvent", (ev:CustomEvent<HIDJoystickEvent>) => setLastHidJoystickEvent(ev.detail));
                    ref.current.addEventListener("hidButtonEvent", (ev:CustomEvent<HIDButtonEvent>) => setLastHidButtonEvent(ev.detail));
                    if(!props.isAnyFocusable()){
                        ref.current.tabIndex = -1;
                        ref.current.style.outline = "none";
                        ref.current.focus();
                    }
                    ref.current["hooked"] = true;
                }
            }, [ref.current]);

            const navProps = new NavigationProps(parentNavProps, horizontal ?
                {navigateLeft:handleNavigateBackwards, navigateRight:handleNavigateForwards} :
                {navigateUp:handleNavigateBackwards, navigateDown:handleNavigateForwards});
            
            return <div ref={ref} className={classes.scrollArea}>
                    <div ref={scrollRef} className={classes.scroll}/>
                    {React.Children.map(children, (child, index) => {
                        return <FocusContext.Provider value={props.getFocusPropsForChild(index)}>
                            <NavigationContext.Provider value={navProps}>
                                {child}
                            </NavigationContext.Provider>
                        </FocusContext.Provider>
                    })}
                    
                </div>
        }}
    </Layout>
    
}