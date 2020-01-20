import React from "react"
import {createUseStyles} from "react-jss"
import clsx from "clsx"
import ButtonA from "./Icons/ButtonA"

const useStyles = createUseStyles({
    commandButton: {
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "5px",
        padding: "18px 21px"
    },
    commandButtonActive: {
        backgroundColor: "#00f5ff17"
    },
    text: {
        marginLeft: "12px"
    }
});

export default function CommandButton({iconButton, text}:{iconButton: React.ReactElement, text: string}){
    const classes = useStyles();

    const [isActive, setActive] = React.useState(false);

    const handleActivate = React.useCallback(() => {
        setActive(true);
    }, []);

    const handleDeactivate = React.useCallback(() => {
        setActive(false);
    }, []);

    return <div className={clsx(classes.commandButton, isActive && classes.commandButtonActive)}
                onTouchStart={handleActivate}
                onTouchEnd={handleDeactivate}>
        {iconButton}<span className={classes.text}>{text}</span>
    </div>
}