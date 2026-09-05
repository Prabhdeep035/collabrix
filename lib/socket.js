import {io} from "socket.io-client";

export const createSocket=(token)=>{   
    const SOCKET_URL=process.env.NEXT_PUBLIC_SOCKET_URL;
    
    return io(SOCKET_URL,{
        auth:{
            token
        }
    })
    autoConnect:false
}