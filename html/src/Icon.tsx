import React from "react";
import {HIDButtonBitField} from "./WebIPCHID";
import ButtonA from "./Icons/ButtonA";
import ButtonB from "./Icons/ButtonB";
import ButtonY from "./Icons/ButtonY";
import ButtonX from "./Icons/ButtonX";
import ButtonMinus from "./Icons/ButtonMinus";
import ButtonPlus from "./Icons/ButtonPlus";
import LStick from "./Icons/LStick";
import RStick from "./Icons/RStick";
import ButtonL from "./Icons/ButtonL";
import ButtonR from "./Icons/ButtonR";
import ButtonZL from "./Icons/ButtonZL";
import ButtonZR from "./Icons/ButtonZR";
import LeftPad from "./Icons/LeftPad";
import RightPad from "./Icons/RightPad";
import UpPad from "./Icons/UpPad";
import DownPad from "./Icons/DownPad";

export const IconButtonMap = new Map<HIDButtonBitField, React.FunctionComponent<IconCommonProps>>([
    [HIDButtonBitField.A, ButtonA],
    [HIDButtonBitField.B, ButtonB],
    [HIDButtonBitField.Y, ButtonY],
    [HIDButtonBitField.X, ButtonX],
    [HIDButtonBitField.LeftStick, LStick],
    [HIDButtonBitField.RightSitck, RStick],
    [HIDButtonBitField.L, ButtonL],
    [HIDButtonBitField.R, ButtonR],
    [HIDButtonBitField.ZL, ButtonZL],
    [HIDButtonBitField.ZR, ButtonZR],
    [HIDButtonBitField.Plus, ButtonPlus],
    [HIDButtonBitField.Minus, ButtonMinus],
    [HIDButtonBitField.LeftPad, LeftPad],
    [HIDButtonBitField.UpPad, UpPad],
    [HIDButtonBitField.RightPad, RightPad],
    [HIDButtonBitField.DownPad, DownPad]
]);

export interface IconCommonProps{
    className?:string;
    size?:number;
    variant?:string;
}

interface IconInputProps extends IconCommonProps{
    svgPath:string;
    viewBox?:string;
}

export function Icon(props:IconInputProps){
    const size = props.size ? props.size : 26;
    const classname = props.className ? props.className : null;
    const viewBox = props.viewBox ? props.viewBox : "0 0 1024 1024";

    return <svg className={classname} viewBox={viewBox} height={size} width={size}>
        <path d={props.svgPath}/>
    </svg>
}