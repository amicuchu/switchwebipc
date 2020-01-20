#include <cstddef>
#include <vector>
#include <array>
#include <string>
#include <typeinfo>
#include <type_traits>
#include <cstring>
#include "../msgpack11/msgpack11.hpp"

using msgpack11::MsgPack;

enum MetaMemberBaseType{
    Nothing,
    ObjectKeyValue,
    ObjectNamed,
    Array
};

struct MetaMemberInfo{
    std::size_t typeHash{0};
    size_t typeSize{0};
    uint32_t offset{0};
    std::string_view name{};
    MetaMemberBaseType detectedBase{Nothing};

    template<typename Type>
    constexpr MetaMemberInfo(uint32_t offset, std::string_view name){
        this->typeSize = sizeof(Type);
        this->offset = offset;
        this->name = name;
        this->typeHash = typeid(Type).hash_code();
        if(std::is_convertible<Type, MsgPackArrayBase>::value){
            this->detectedBase = MetaMemberBaseType::Array;
        }
    }

    void checkMember(MsgPack pack){
        if constexpr(typeHash == typeid(uint8_t).hash_code){
            if(!pack.is_uint8()){
                throw "Not an uint8";
            }
        }else if constexpr(typeHash == typeid(uint16_t).hash_code){
            if(!pack.is_uint16()){
                throw "Not an uint16";
            }
        }else if constexpr(typeHash == typeid(uint32_t).hash_code){
            if(!pack.is_uint32()){
                throw "Not an uint32";
            }
        }else if constexpr(typeHash == typeid(uint64_t).hash_code){
            if(!pack.is_uint64()){
                throw "Not an uint64";
            }
        }else if constexpr(typeHash == typeid(int8_t).hash_code){
            if(!pack.is_int8()){
                throw "Not an int8";
            }
        }else if constexpr(typeHash == typeid(int16_t).hash_code){
            if(!pack.is_int16()){
                throw "Not an int16";
            }
        }else if constexpr(typeHash == typeid(int32_t).hash_code){
            if(!pack.is_int32()){
                throw "Not an int32";
            }
        }else if constexpr(typeHash == typeid(int64_t).hash_code){
            if(!pack.is_int64()){
                throw "Not an int64";
            }
        }else if constexpr(typeHash == typeid(std::string).hash_code){
            if(!pack.is_string()){
                throw "Not a string";
            }
        }else if constexpr(typeHash == typeid(std::vector<char>).hash_code){
            if(!pack.is_binary()){
                throw "Not a binary";
            }
        }else if constexpr(typeHash == typeid(MsgPack).hash_code){

        }else{
            throw "Unknown type";
        }
    }

    template<typename TypeCheck, typename... OtherTypes>
    void checkMember(MsgPack pack){
        if constexpr(typeHash == typeid(TypeCheck).hash_code){
            T m = T{pack};
        }else{
            checkMember<&OtherTypes>(pack);
        }
    }

    void copyMember(void* destination, MsgPack value){
        if constexpr(typeHash == typeid(uint32_t).hash_code){
            uint32_t val = value.uint32_value();
            memcpy(this, &val, typeSize);
        }
    }

    constexpr MetaMemberInfo() = default;
};

struct MsgPackArrayBase {

    using ArrayMemberInfo = std::array<MetaMemberInfo, 5>;
    static constexpr ArrayMemberInfo META{};

    MsgPackArrayBase(std::vector<char> binary, const ArrayMemberInfo &meta = META){
        MsgPack pack(binary);
        if(!pack.is_array()){
            throw "error";
        }

        for(MetaMemberInfo member : meta) {
            if(member.typeSize == 0) break;
            member.checkMember(pack);
            member.copyMember(this, pack);
        }

    }
};

template <typename PT>
struct WebIPCRequestHeader : MsgPackArrayBase{
    uint64_t submodule;
    uint64_t action;
    PT *payload;
    
    static constexpr ArrayMemberInfo META{
        MetaMemberInfo<uint64_t>{}
    };

    WebIPCRequestHeader(std::vector<char> binary) : MsgPackArrayBase(binary, META){
        
    }
    
};