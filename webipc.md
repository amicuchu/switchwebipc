# The WebIPC protocol

WebIPC is a internal message protocol that uses websession to bridge js code with native code.

A WebIPC message is a null ended C string that contains a base64 MessagePack

The protocol is designed for one to one comunication
The protocol flow begins with a request from js to the native bridge, asynchronously the bridge answers one or multiple times.
The js side must not send any new request before the previously sended request is answered at least once
The protocol defines the next concepts:

1. A unique request ID
2. The ID of the submodule that is gonna handle the request
3. The action number that indicates the module what is requesting the js code
4. An error code format describing the reason of why a request failed

## Basic headers
### Header for request

A request is formed by the next MsgPack sequence

-----------------------------------------------------------------------
| Start of Array | u8 submodule | u32 action | payload | End of Array |
-----------------------------------------------------------------------

The field payload represents a msgpack object that will be parsed by the submodule depending of the chosen action

### Header for answer

An answer is formed by the next MsgPack sequence

---------------------------------------------------------------------------------
| Start of Array | u32 requestID | boolean lastMessage | payload | End of Array |
---------------------------------------------------------------------------------

The field payload represents a msgpack object created by the submodule as answer to the payload
If the answer arrives after a request, requestID represents the assigned ID to the previous request, otherwise, the answer refers to an existant request refered by the ID
If lastMessage is true, then this is the last answer for that request so the next answers to that ID may not refer to the assigned request and can reapear as ID of a new request. If lastMessage is false, then isn't the last answer for that request and additional answers refered to that request may appear.

### Header for error

An answer is formed by the next MsgPack sequence

-------------------------------------------------------------------------
| Start of Array | u32 or null requestID | u32 errorCode | End of Array |
-------------------------------------------------------------------------

The field requestID can be an u32 or a null. If requestID is an u32, then refers to an existant request. If requestID is null, then refers the previous request done. In both ways, the request is not gonna answer again and ID could be reused
The field errorCode describes the error that ended the request. That number is composed by an u8 refered to the submodule that emited that error and a u24 that describes the error

## Submodules

Submodules ID are preassigned according the next table:

-----------------------
| Submodule ID | Name |
-----------------------
| 1            | HID  |
-----------------------

Submodule ID 0 doesn't exist and only can refered in error code for indicate that error was produced by the coordinator that decodes and forwards messages to the submodules 
