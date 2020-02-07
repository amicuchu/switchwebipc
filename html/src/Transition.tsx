import React from "react";
import clsx from "clsx";
import {createUseStyles} from "react-jss";

enum TransitionPhase{
    Out,
    TransitioningIn,
    In,
    TransitioningOut
}

const useStyles = createUseStyles({
    transition:{
        position: "absolute",
        top: 0,
        height: "100%",
        width: "100%"
    },
    transitionOut:{
        display: "none"
    }
})

export default function Transition({children, visible=true, transition=""}:{children:any, visible?:boolean, transition?:string}){
    const ref = React.useRef<HTMLDivElement>()
    const animRef = React.useRef<Animation>();
    const classes = useStyles();
    const animLookup = {
        "": [
            [
                {opacity: 0.0},
                {opacity: 1.0}
            ],
            [
                {opacity: 1.0},
                {opacity: 0.0}
            ]
        ],
        "slide": [
            [
                {opacity: 0.0, transform: "translateX(-100px)"},
                {opacity: 1.0, transform: "translateX(0px)"}
            ],
            [
                {opacity: 1.0, transform: "translateX(0px)"},
                {opacity: 0.0, transform: "translateX(100px)"}
            ]
        ]
    }
    const [transitionPhase, setTransitionPhase] = React.useState(TransitionPhase.Out);
    console.log("Transition");
    console.log("visible: " + visible);
    console.log("transition: " + transition);
    console.log("state: "+ transitionPhase);

    React.useEffect(() => {
        if(ref.current){
            if(visible && transitionPhase === TransitionPhase.Out){
                console.log("Transition out to in");
                animRef.current  = ref.current.animate(animLookup[transition][0],
                    {duration:200, iterations: 1});
                setTransitionPhase(TransitionPhase.TransitioningIn);
                animRef.current.addEventListener("finish", () => {
                    console.log("Transition out to in finished");
                    setTransitionPhase(TransitionPhase.In);
                });
            }else if(!visible && transitionPhase === TransitionPhase.In){
                console.log("Transition in to out");
                animRef.current  = ref.current.animate(animLookup[transition][1],
                    {duration:200, iterations: 1});
                setTransitionPhase(TransitionPhase.TransitioningOut);
                animRef.current.addEventListener("finish", () =>{
                    setTransitionPhase(TransitionPhase.Out);
                    ref.current.classList.add(classes.transitionOut);
                });
            }
        }
    }, [ref.current, visible]);
    return <div ref={ref} className={clsx(classes.transition,
                                          transitionPhase === TransitionPhase.Out && classes.transitionOut)}>
        {transitionPhase === TransitionPhase.Out ? null : children}
    </div>;
}