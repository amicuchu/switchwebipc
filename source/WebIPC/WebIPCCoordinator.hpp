#pragma once

#include "../WebSessionHandler.hpp"
#include "WebIPCHandler.hpp"
#include <map>
#include <mutex>
#include <exception>
#include "../msgpack11.hpp"


#define REQUEST_LIST_SIZE 50

using msgpack11::MsgPack;

class WebIPCHandler;
class WebIPCRequest;

enum MsgPackIPCError : u32{
    UnknownErrorInHandlingRequest = 0x00000000,
    RootNotAnArray = 0x00000001,
    RootIncorrectSize = 0x00000002,
    SubmoduleIncorrectType = 0x00000003,
    SubmoduleNotFound = 0x00000004,
    ActionIncorrectType = 0x00000005
};

class InvalidRequestIDException : public std::runtime_error{
public:
    InvalidRequestIDException() : std::runtime_error("RequestID is not registered in the coordinator"){}
};

class WebSessionClosedException : public std::runtime_error{
public:
    WebSessionClosedException() : std::runtime_error("Websession was closed"){}
};

class WebIPCCoordinator : public WebSessionHandler{
public:
    WebIPCCoordinator();
    ~WebIPCCoordinator();
    void giveWebSession(std::weak_ptr<WebSession> webSession) override;
    void handleMessage(const std::vector<u8> &data) override;

    void answerRequest(uint32_t requestID, MsgPack packAnswer, bool lastAnswer = true);
    void errorRequest(uint32_t requestID, u32 errorCode);

    void addSubmodule(uint32_t subID, std::unique_ptr<WebIPCHandler> &&submodule);
private:
    uint32_t nextID;
    std::weak_ptr<WebSession> webSession;
    std::map<uint8_t, std::unique_ptr<WebIPCHandler>> submodules;
    std::map<uint32_t, WebIPCRequest*> pendingRequests;
    std::map<uint32_t, void*> currentTransactions;
    std::mutex requestStorageLock;

    void sendMsgPack(const MsgPack &pack);
    void errorInmediateRequest(u32 errorCode);
    void removeRequestID(u32 requestID);
};