
import MsgPack, { Codec } from 'msgpack-lite'

function str2ab(str) {
    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
}

interface Submodule{
    handleMessage:(action: number, payload: any) => void;
}

export class WebIPCRequest{
    submodule:number;
    action:number;
    payload:any;
    callback:(answer:any, lastMessage:boolean)=>void;
    requestID:number;
    constructor(submodule, action, payload, callback){
        this.submodule = submodule;
        this.action = action;
        this.payload = payload;
        this.callback = callback;
    }


}

export class WebIPCError{
    error:number;
    constructor(error:number){
        this.error = error;
    }
}

export class WebIPC{
    codec:MsgPack.Codec;
    lastRequest:WebIPCRequest;
    requestMap:Map<number,WebIPCRequest>;
    sendingQueue:Array<WebIPCRequest>;
    constructor(){
        window.nx.addEventListener("message", this.handleData.bind(this));
        this.codec = MsgPack.createCodec({usemap: true, binarraybuffer:true});
        this.requestMap = new Map();
        this.sendingQueue = new Array();
    }

    handleData(ev: MessageEvent){
        const msgpack = atob(ev.data);
        const msgRoot = MsgPack.decode(new Uint8Array(str2ab(msgpack)), {codec: this.codec});

        if(!(msgRoot instanceof Array)){
            return;
        }

        if(msgRoot.length > 3){
            return;
        }

        let requestToAnswer:WebIPCRequest;
        if(msgRoot[0] == null){
            requestToAnswer = this.lastRequest;
            this.lastRequest = null;
        }else if(typeof(msgRoot[0]) == "number"){
            if(this.requestMap.has(msgRoot[0])){
                requestToAnswer = this.requestMap[msgRoot[0]];
            }else{
                requestToAnswer = this.lastRequest;
                this.lastRequest = null;
                requestToAnswer.requestID = msgRoot[0];
                this.requestMap[msgRoot[0]] = requestToAnswer;
            }
        }else{
            return;
        }

        if(this.lastRequest) this.processSendQueue();

        if(typeof(msgRoot[1]) == "boolean"){
            requestToAnswer.callback(msgRoot[2], msgRoot[1]);
            if(msgRoot[1]) this.requestMap.delete(requestToAnswer.requestID);
        }
        if(typeof(msgRoot[1]) == "number"){
            requestToAnswer.callback(new WebIPCError(msgRoot[2]), true)
            this.requestMap.delete(requestToAnswer.requestID);
        }
    }

    processSendQueue(){
        if(this.sendingQueue.length > 0){
            const request = this.sendingQueue.shift();
            const msgpack = MsgPack.encode([request.submodule, request.action, request.payload], {codec: this.codec});
            window.nx.sendMessage(ab2str(msgpack));
            this.lastRequest = request;
        }
    }

    sendRequest(request:WebIPCRequest){
        if(this.sendingQueue.length > 0){
            this.sendingQueue.push(request);
        }else{
            this.sendingQueue.push(request);
            this.processSendQueue();
        }
    }
}