import {WebIPC, WebIPCRequest, WebIPCError} from "./WebIPC"

export enum HIDButtonBitField{
    A = 1 << 0,
    B = 1 << 1,
    X = 1 << 2,
    Y = 1 << 3,
    LeftStick = 1 << 4,
    RightSitck = 1 << 5,
    L = 1 << 6,
    R = 1 << 7,
    ZL = 1 << 8,
    ZR = 1 << 9,
    Plus = 1 << 10,
    Minus = 1 << 11,
    LeftPad = 1 << 12,
    UpPad = 1 << 13,
    RightPad = 1 << 14,
    DownPad = 1 << 15,
    SLLeft = 1 << 24,
    SRLeft = 1 << 25,
    SLRight = 1 << 26,
    SRRight = 1 << 27
}

const HIDButtonList = [
    HIDButtonBitField.A,
    HIDButtonBitField.B,
    HIDButtonBitField.X,
    HIDButtonBitField.Y,
    HIDButtonBitField.LeftStick,
    HIDButtonBitField.RightSitck,
    HIDButtonBitField.L,
    HIDButtonBitField.R,
    HIDButtonBitField.ZL,
    HIDButtonBitField.ZR,
    HIDButtonBitField.Plus,
    HIDButtonBitField.Minus,
    HIDButtonBitField.LeftPad,
    HIDButtonBitField.UpPad,
    HIDButtonBitField.RightPad,
    HIDButtonBitField.DownPad,
    HIDButtonBitField.SLLeft,
    HIDButtonBitField.SRLeft,
    HIDButtonBitField.SLRight,
    HIDButtonBitField.SRRight
]



export class HIDButtonEvent{
    button:HIDButtonBitField
    pressed:boolean
    constructor(bt:HIDButtonBitField, pr:boolean){
        this.button = bt;
        this.pressed = pr;
    }

    static clonePlaneObject(evPlane){
        return new HIDButtonEvent(evPlane.button, evPlane.pressed);
    }

    isButtonPressed(button:HIDButtonBitField){
        return !!(this.button&button) && this.pressed;
    }

    isButtonPresent(button:HIDButtonBitField){
        return !!(this.button&button);
    }

    getListOfButtons(){
        let ret = new Array<HIDButtonBitField>();
        for(let button of HIDButtonList){
            if(this.isButtonPressed(button)){
                ret.push(button)
            }
        }
        return ret;
    }

    getCustomEvent(){
        return new CustomEvent("hidButtonEvent", {bubbles: true, detail: this as HIDButtonEvent});
    }
}

export class HIDJoystickEvent{
    leftJoystick:boolean;
    axisX:number;
    axisY:number;
    constructor(leftJoystick:boolean, axisX: number, axisY:number){
        this.leftJoystick = leftJoystick;
        this.axisX = axisX;
        this.axisY = axisY;
    }

    getCustomEvent(){
        return new CustomEvent("hidJoystickEvent", {bubbles: true, detail: this as HIDJoystickEvent});
    }

}


export class HIDSubmodule{
    coordinator:WebIPC;
    hidEventRequest:WebIPCRequest;

    constructor(coord:WebIPC){
        this.coordinator = coord;
        this.hidEventRequest = null;
    }

    activateHIDEvents(){
        this.hidEventRequest = new WebIPCRequest(1, 0, null, this.handleHIDEvent.bind(this));
        this.coordinator.sendRequest(this.hidEventRequest);
    }

    isHIDEventsActive(){
        return this.hidEventRequest != null;
    }

    handleHIDEvent(data:any, lastMessage:boolean){
        if(lastMessage) this.hidEventRequest = null;
    }

}

export class HIDSubmoduleSimulation extends HIDSubmodule{
    timeHandle:any;
    lastButtonReading:boolean[];
    lastAxisReading:number[];
    handleKeyDownBind:(ev:KeyboardEvent)=>void;
    handleKeyUpBind:(ev:KeyboardEvent)=>void;
    
    constructor(){
        super(null);
        this.lastButtonReading = new Array(16).fill(0);
        this.lastAxisReading = new Array(4).fill(0.0);
    }

    activateHIDEvents(){
        this.timeHandle = setInterval(() => {
            this.pollGamepads();
        }, 1000/60);
        this.handleKeyDownBind = this.handleKeyDown.bind(this);
        this.handleKeyUpBind = this.handleKeyUp.bind(this);
        document.addEventListener("keydown", this.handleKeyDownBind);
        document.addEventListener("keyup", this.handleKeyUpBind);
    }

        
    static readonly buttonMapping:{[key: number]: HIDButtonBitField} = {
        0: HIDButtonBitField.B,
        1: HIDButtonBitField.A,
        2: HIDButtonBitField.Y,
        3: HIDButtonBitField.X,
        4: HIDButtonBitField.L,
        5: HIDButtonBitField.R,
        6: HIDButtonBitField.ZL,
        7: HIDButtonBitField.ZR,
        8: HIDButtonBitField.Minus,
        9: HIDButtonBitField.Plus,
        10: HIDButtonBitField.LeftStick,
        11: HIDButtonBitField.RightSitck,
        12: HIDButtonBitField.UpPad,
        13: HIDButtonBitField.DownPad,
        14: HIDButtonBitField.LeftPad,
        15: HIDButtonBitField.RightPad
    };

    handleKeyDown(ev:KeyboardEvent){
        console.log(ev);
        if(ev.key === "ArrowUp"){
            document.activeElement.dispatchEvent(new HIDButtonEvent(HIDButtonBitField.UpPad, true).getCustomEvent());
        }else if(ev.key === "ArrowDown"){
            document.activeElement.dispatchEvent(new HIDButtonEvent(HIDButtonBitField.DownPad, true).getCustomEvent());
        }else if(ev.key === "ArrowLeft"){
            document.activeElement.dispatchEvent(new HIDButtonEvent(HIDButtonBitField.LeftPad, true).getCustomEvent());
        }else if(ev.key === "ArrowRight"){
            document.activeElement.dispatchEvent(new HIDButtonEvent(HIDButtonBitField.RightPad, true).getCustomEvent());
        }else if(ev.key === "Enter"){
            document.activeElement.dispatchEvent(new HIDButtonEvent(HIDButtonBitField.A, true).getCustomEvent());
        }else if(ev.key === "Escape"){
            document.activeElement.dispatchEvent(new HIDButtonEvent(HIDButtonBitField.B, true).getCustomEvent());
        }
    }

    handleKeyUp(ev:KeyboardEvent){
        console.log(ev);
        if(ev.key === "ArrowUp"){
            document.activeElement.dispatchEvent(new HIDButtonEvent(HIDButtonBitField.UpPad, false).getCustomEvent());
        }else if(ev.key === "ArrowDown"){
            document.activeElement.dispatchEvent(new HIDButtonEvent(HIDButtonBitField.DownPad, false).getCustomEvent());
        }else if(ev.key === "ArrowLeft"){
            document.activeElement.dispatchEvent(new HIDButtonEvent(HIDButtonBitField.LeftPad, false).getCustomEvent());
        }else if(ev.key === "ArrowRight"){
            document.activeElement.dispatchEvent(new HIDButtonEvent(HIDButtonBitField.RightPad, false).getCustomEvent());
        }else if(ev.key === "Enter"){
            document.activeElement.dispatchEvent(new HIDButtonEvent(HIDButtonBitField.A, false).getCustomEvent());
        }else if(ev.key === "Escape"){
            document.activeElement.dispatchEvent(new HIDButtonEvent(HIDButtonBitField.B, false).getCustomEvent());
        }
    }

    pollGamepads(){
        const gamepads = navigator.getGamepads();
        if(gamepads.length > 0 && gamepads[0]){
            let gamepad = gamepads[0];
            let releasedKeys:HIDButtonBitField = 0;
            let pressedKeys:HIDButtonBitField = 0;

            this.lastButtonReading = this.lastButtonReading.map((lastReading, index) => {
                const newReading = gamepad.buttons[index].pressed;
                if(lastReading != newReading){
                    if(newReading){
                        pressedKeys |= HIDSubmoduleSimulation.buttonMapping[index];
                    }else{
                        releasedKeys |= HIDSubmoduleSimulation.buttonMapping[index];
                    }
                }
                return gamepad.buttons[index].pressed;
            });

            let axisChanged = [false, false, false, false];
            this.lastAxisReading = this.lastAxisReading.map((lastReading, index) => {
                axisChanged[index] = axisChanged[index] || gamepad.axes[index] != lastReading;
                return gamepad.axes[index];
            });

            pressedKeys > 0 && document.activeElement.dispatchEvent(new HIDButtonEvent(pressedKeys, true).getCustomEvent());
            releasedKeys > 0 && document.activeElement.dispatchEvent(new HIDButtonEvent(releasedKeys, false).getCustomEvent());
            (axisChanged[0] || axisChanged[1]) &&
                document.activeElement.dispatchEvent(new HIDJoystickEvent(true, this.lastAxisReading[0], this.lastAxisReading[1]).getCustomEvent());
            (axisChanged[2] || axisChanged[3]) &&
                document.activeElement.dispatchEvent(new HIDJoystickEvent(false, this.lastAxisReading[2], this.lastAxisReading[3]).getCustomEvent());
        }
    }

    deactivateHIDEvents(){
        clearInterval(this.timeHandle);
        document.removeEventListener("keydown",this.handleKeyDownBind);
    }
}