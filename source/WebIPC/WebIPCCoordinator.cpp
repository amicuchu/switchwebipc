#include <string>
#include "../Log.hpp"
#include "WebIPCCoordinator.hpp"
#include "../base64.h"

WebIPCCoordinator::WebIPCCoordinator() : 
    submodules{},
    pendingRequests{}
{

}

WebIPCCoordinator::~WebIPCCoordinator(){
    auto requests = pendingRequests;
    for(auto &request : requests){
        if(request.second->cancelRequest){
            request.second->cancelRequest();
        }
    }
}

void WebIPCCoordinator::sendMsgPack(const MsgPack &pack){
    auto const &packedMessage = pack.dump();
    std::vector<u8> encodedMessage = base64_encode(reinterpret_cast<const unsigned char*>(packedMessage.data()), packedMessage.size());
    if(webSession.expired()){
        throw WebSessionClosedException{};
    }
    webSession.lock()->sendMessage(std::move(encodedMessage)); 
}

void WebIPCCoordinator::errorInmediateRequest(u32 errorCode){
    sendMsgPack(MsgPack::array{MsgPack{nullptr}, MsgPack{errorCode}});
}

void WebIPCCoordinator::removeRequestID(u32 requestID){
    {
        std::scoped_lock scLock{this->requestStorageLock};
        auto request = pendingRequests.find(requestID);
        if(request == pendingRequests.end()){
            throw InvalidRequestIDException{};
        }

        pendingRequests.erase(requestID);
    }
}

void WebIPCCoordinator::addSubmodule(uint32_t subID, std::unique_ptr<WebIPCHandler> &&submodule){
    submodules[subID] = std::forward<std::unique_ptr<WebIPCHandler>>(submodule);
}

void WebIPCCoordinator::handleMessage(const std::vector<u8> &encodedData){
    std::string_view text(reinterpret_cast<const char*>(encodedData.data()), encodedData.size());
    std::vector<u8> data = base64_decode(text);
    std::string err;
    
    auto parsedMsg = MsgPack::parse(reinterpret_cast<const char*>(data.data()), data.size(), err);
    if(!parsedMsg.is_array()){
        errorInmediateRequest(MsgPackIPCError::RootNotAnArray);
        return;
    }

    if(parsedMsg.array_items().size() != 3){
        errorInmediateRequest(MsgPackIPCError::RootIncorrectSize);
        return;
    }
    
    auto submodule = parsedMsg.array_items()[0];
    if(!submodule.is_uint8()){
        errorInmediateRequest(MsgPackIPCError::SubmoduleIncorrectType);
        return;
    }

    auto submodulesIterPair = submodules.find(submodule.uint8_value());
    if(submodulesIterPair == submodules.end()){
        errorInmediateRequest(MsgPackIPCError::SubmoduleNotFound);
        return;
    }

    auto action = parsedMsg[1];
    if(!action.is_uint32()){
        errorInmediateRequest(MsgPackIPCError::ActionIncorrectType);
        return;
    }
    
    WebIPCRequest* request;
    {
        std::scoped_lock scLock{this->requestStorageLock};

        if(pendingRequests.size() > REQUEST_LIST_SIZE){
            errorInmediateRequest(0);
            return;
        }

        while(pendingRequests.count(nextID) > 0) nextID++;

        request = new WebIPCRequest{
            .requestID = nextID++,
            .submodule = submodule.uint8_value(),
            .action = action.uint32_value(),
            .returnCoordinator = this,
            .cancelRequest = nullptr,
            .requestData = parsedMsg[2]
        };

        g_Logger.print("WebIPCCoordinator: A new request has been assigned to ID " + 
                       std::to_string(request->requestID) + " for submodule " + std::to_string(request->submodule) + 
                       " action " + std::to_string(request->action));

        pendingRequests[request->requestID] = request;
    }

    try{
        submodulesIterPair->second->handleRequest(request);
    }catch(...){
        g_Logger.print("WebIPCCoordinator: The request raised unknown exception on handling");
        errorInmediateRequest(MsgPackIPCError::UnknownErrorInHandlingRequest);
        removeRequestID(request->requestID);
    }
}

void WebIPCCoordinator::answerRequest(uint32_t requestID, MsgPack packAnswer, bool lastAnswer){
    if(lastAnswer){
        removeRequestID(requestID);
        g_Logger.print("WebIPCCoordinator: The request " + std::to_string(requestID) + " ended succesfully");
    }

    sendMsgPack(MsgPack::array{MsgPack{requestID}, MsgPack{lastAnswer}, packAnswer});
}

void WebIPCCoordinator::errorRequest(uint32_t requestID, u32 errorCode){
    removeRequestID(requestID);

    g_Logger.print("WebIPCCoordinator: The request " + std::to_string(requestID) + " ended in error " + std::to_string(errorCode));

    sendMsgPack(MsgPack::array{MsgPack{requestID}, MsgPack{errorCode}});
}



void WebIPCCoordinator::giveWebSession(std::weak_ptr<WebSession> webSession){
    this->webSession = webSession;
}
