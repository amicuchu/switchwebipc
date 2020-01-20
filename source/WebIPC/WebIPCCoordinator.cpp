#include <string>
#include "WebIPCCoordinator.hpp"
#include "../../cpp-base64/base64.h"

constexpr int a(int b){
    return b;
}

inline void sendErrorMessage(WebIPCCoordinator *coord, u64 error){
    
}

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

void WebIPCCoordinator::addSubmodule(uint32_t subID, std::unique_ptr<WebIPCHandler> &&submodule){
    submodules[subID] = std::forward<std::unique_ptr<WebIPCHandler>>(submodule);
}

void WebIPCCoordinator::handleMessage(const std::vector<u8> &encodedData){
    std::string_view text(reinterpret_cast<const char*>(encodedData.data()), encodedData.size());
    std::vector<u8> data = base64_decode(text);
    std::string err;
    
    auto parsedMsg = MsgPack::parse(reinterpret_cast<const char*>(data.data()), data.size(), err);
    if(!parsedMsg.is_array()){
        throw "Root is not an array";
    }

    if(parsedMsg.array_items().size() != 3){
        throw "The root isn't an array of 3 elements";
    }
    
    auto submodule = parsedMsg.array_items()[0];
    if(!submodule.is_uint8()){
        throw "Submodule isn't a u8";
    }

    auto submodulesIterPair = submodules.find(submodule.uint8_value());
    if(submodulesIterPair == submodules.end()){
        throw "Submodule isn't registered in the coordinator";
    }

    auto action = parsedMsg[1];
    if(!action.is_uint32()){
        throw "Action isn't a u32";
    }
    
    WebIPCRequest* request;
    {
        std::scoped_lock scLock{this->requestStorageLock};
        request = new WebIPCRequest{
            .requestID = nextID++,
            .submodule = submodule.uint8_value(),
            .action = action.uint32_value(),
            .returnCoordinator = this,
            .cancelRequest = nullptr,
            .requestData = parsedMsg[2]
        };
        pendingRequests[request->requestID] = request;
    }
    submodulesIterPair->second->handleRequest(request);
}

void WebIPCCoordinator::answerRequest(uint32_t requestID, MsgPack packAnswer, bool lastAnswer){
    MsgPack packMessage;
    {
        std::scoped_lock scLock{this->requestStorageLock};
        auto request = pendingRequests.find(requestID);
        if(request == pendingRequests.end()){
            throw "Invalid ID";
        }

        if(lastAnswer) pendingRequests.erase(requestID);

        packMessage = MsgPack::array{MsgPack{requestID}, MsgPack{request->second->action}, MsgPack{lastAnswer}, packAnswer};
    }
    auto const &packedMessage = packMessage.dump();
    std::vector<u8> encodedMessage = base64_encode(reinterpret_cast<const unsigned char*>(packedMessage.data()), packedMessage.size());
    if(webSession.expired()){
        throw "WebSession closed";
    }
    webSession.lock()->sendMessage(std::move(encodedMessage)); 
    
}



void WebIPCCoordinator::giveWebSession(std::weak_ptr<WebSession> webSession){
    this->webSession = webSession;
}
