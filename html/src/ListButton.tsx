import React from "react"
import {createUseStyles} from "react-jss"
import clsx from "clsx"

const useStyles = createUseStyles({
    listButton: {
        position: "relative",
        border: "solid #d1d1d1",
        borderWidth: "1px 0 0 0",
        outline: "none"
    },
    listButtonActive: {
        backgroundColor: "#fdfdfd"
    },
    contentBox: {
        padding: "20px 15px"
    },
    contentBoxHover: {
        backgroundColor: "#00f5ff17"
    },
    outlineBox: {
        position: "absolute",
        top: "0px",
        height: "100%",
        width: "100%",
        border: "4px solid",
        margin: "-2px",
        borderRadius: "4px",
        borderColor: "#59fcdd",
        boxShadow: "0px 1px 3px 0px #06bcc7",
        zIndex: 1
    } 
});

export default function ListButton({children}:{children: any}){
    const classes = useStyles();

    const [isActive, setActive] = React.useState(false);

    const outlineRef : React.Ref<HTMLDivElement> = React.createRef();
    React.useEffect(() =>  {
        if(outlineRef.current){
            outlineRef.current.animate([
                {borderColor: "#59fcdd"},
                {borderColor: "#06bcc7"},
                {borderColor: "#59fcdd"}
            ], {duration: 1000, iterations: Infinity});
        }
    }, [outlineRef.current, isActive]);
    const [isHovered, setHover] = React.useState(false);

    const handleHoverIn = React.useCallback(() => {
        setHover(true);
    }, []);

    const handleHoverOut = React.useCallback(() => {
        setHover(false);
    }, []);

    const handleActivate = React.useCallback(() => {
        setActive(true);
    }, []);

    const handleUnactivate = React.useCallback(() => {
        setActive(false);
    }, []);

    return <div tabIndex={-1}
        className={clsx(classes.listButton,
            isActive && classes.listButtonActive)}
        onTouchStart={handleHoverIn}
        onTouchEnd={handleHoverOut}
        onFocus={handleActivate}
        onBlur={handleUnactivate}>
        <div className={clsx(classes.contentBox,
            isHovered && classes.contentBoxHover)}>
            {children}
        </div>
        {isActive &&
            <div className={classes.outlineBox} ref={outlineRef}/>
        }
    </div>
}