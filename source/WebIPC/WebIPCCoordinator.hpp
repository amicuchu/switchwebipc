#pragma once

#include "../WebSessionHandler.hpp"
#include "WebIPCHandler.hpp"
#include <map>
#include <mutex>
#include "../../msgpack11/msgpack11.hpp"

using msgpack11::MsgPack;

class WebIPCHandler;
class WebIPCRequest;

enum MsgPackIPCError{

};

class WebIPCCoordinator : public WebSessionHandler{
public:
    WebIPCCoordinator();
    ~WebIPCCoordinator();
    void giveWebSession(std::weak_ptr<WebSession> webSession) override;
    void handleMessage(const std::vector<u8> &data) override;

    void answerRequest(uint32_t requestID, MsgPack packAnswer, bool lastAnswer = true);

    void addSubmodule(uint32_t subID, std::unique_ptr<WebIPCHandler> &&submodule);
private:
    uint32_t nextID;
    std::weak_ptr<WebSession> webSession;
    std::map<uint8_t, std::unique_ptr<WebIPCHandler>> submodules;
    std::map<uint32_t, WebIPCRequest*> pendingRequests;
    std::map<uint32_t, void*> currentTransactions;
    std::mutex requestStorageLock;
};