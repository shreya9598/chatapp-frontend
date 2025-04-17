import React, {useEffect, useRef, useState } from 'react'
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router"
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { baseURL } from "../config/AxiosHelper";
import { getMessagess } from "../services/RoomService";
import { timeAgo } from '../util/dateUtil';

const ChatPage = () => {

    const {roomId,currentUser,connected,setConnected,setRoomId,setCurrentUser,} = useChatContext();

    const navigate = useNavigate();

    useEffect(() => {
        if (!connected) {
            navigate("/");
        }
    }, [connected, roomId, currentUser]);


    const [messages, setMessages] = useState([
        // {
        //     content: "Hello",
        //     sender: "Shreya Gupta",
        // }
    ]);
    const [input, setInput] = useState("");
    const inputRef = useRef(null);
    const chatBoxRef = useRef(null);
    const [stompClient, setStompClient] = useState(null);
    // const [roomId, setRoomId] = useState("");


    useEffect(() => {
        async function loadMessages() {
          try {
            const messages = await getMessagess(roomId);
            // console.log(messages);
            setMessages(messages);
          } catch (error) {}
        }
        if (connected) {
          loadMessages();
        }
      }, []);
    
      //scroll down
    
      useEffect(() => {
        if (chatBoxRef.current) {
          chatBoxRef.current.scroll({
            top: chatBoxRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }, [messages]);
    
      //stompClient ko init karne honge
      //subscribe
    
      useEffect(() => {
        const connectWebSocket = () => {
          ///SockJS
          const sock = new SockJS(`${baseURL}/chat`);
          const client = Stomp.over(sock);
    
          client.connect({}, () => {
            setStompClient(client);
    
            toast.success("connected");
    
            client.subscribe(`/topic/room/${roomId}`, (message) => {
              console.log(message);
    
              const newMessage = JSON.parse(message.body);
    
              setMessages((prev) => [...prev, newMessage]);
    
              //rest of the work after success receiving the message
            });
          });
        };
    
        if (connected) {
          connectWebSocket();
        }
    
        //stomp client
      }, [roomId]);
    
      //send message handle
    
      const sendMessage = async () => {
        if (stompClient && connected && input.trim()) {
          console.log(input);
    
          const message = {
            sender: currentUser,
            content: input,
            roomId: roomId,
          };
    
          stompClient.send(
            `/app/sendMessage/${roomId}`,
            {},
            JSON.stringify(message)
          );
          setInput("");
        }
    
        //
      };
    
      function handleLogout() {
        stompClient.disconnect();
        setConnected(false);
        setRoomId("");
        setCurrentUser("");
        navigate("/");
      }
    

  return (
    <div className=''>
        {/* Header */}
        <header className='chat-header'>
            {/* room name container */}
            <div>
                <h1 className='room-name'>Room : <span>{roomId}</span> </h1>
            </div>

            {/* username container */}
            <div>
                <h1 className='user-name'>User : <span>{currentUser}</span> </h1>
                
            </div>

            {/* leave room button */}
            <div>
                <button  onClick = {handleLogout} className='leave-button'>Leave Room</button>
            </div>
        </header>

        <main ref = {chatBoxRef} className='chat-main'>
            {
                messages.map((message, index) => (
                    <div key={index}>
                        <div className='message-container'>
                            <p className='message-sender'>{message.sender}</p>
                            <p className='message-content'>{message.content}</p>
                            <p>{timeAgo(message.timeStamp)}</p>

                        </div>
                        
                    </div>
                ))
            }
        </main>

        {/* input message container */}
        <div className='message-container'>
            <div className='message'>
                <input value={input} onChange = {(e) => {setInput(e.target.value)}} onKeyDown = {(e)=>{
                    if (e.key === "Enter") {
                        sendMessage();
                    }
                }} type="text" className='message-input' placeholder='Type your message here...' />
                <button onClick={sendMessage} className='send-button'>Send</button>
            </div>

        </div>
    </div>
  )
}

export default ChatPage







// import React, { useEffect, useRef, useState } from 'react';
// import { useNavigate } from 'react-router';
// import SockJS from 'sockjs-client';
// import { Stomp } from '@stomp/stompjs';
// import toast from 'react-hot-toast';

// import useChatContext from '../context/ChatContext';
// import { baseURL } from '../config/AxiosHelper';
// import { getMessagess } from '../services/RoomService';
// import { timeAgo } from '../util/dateUtil';

// import '../styles/ChatPage.css'; // ✅ Import the desktop-style CSS

// const ChatPage = () => {
//   const {
//     roomId,
//     currentUser,
//     connected,
//     setConnected,
//     setRoomId,
//     setCurrentUser,
//   } = useChatContext();

//   const navigate = useNavigate();
//   const chatBoxRef = useRef(null);
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const [stompClient, setStompClient] = useState(null);

//   // Redirect if not connected
//   useEffect(() => {
//     if (!connected) {
//       navigate('/');
//     }
//   }, [connected, roomId, currentUser, navigate]);

//   // Load previous messages
//   useEffect(() => {
//     async function loadMessages() {
//       try {
//         const fetchedMessages = await getMessagess(roomId);
//         setMessages(fetchedMessages);
//       } catch (error) {
//         console.error('Failed to load messages:', error);
//       }
//     }

//     if (connected) {
//       loadMessages();
//     }
//   }, [connected, roomId]);

//   // Auto-scroll on new message
//   useEffect(() => {
//     if (chatBoxRef.current) {
//       chatBoxRef.current.scroll({
//         top: chatBoxRef.current.scrollHeight,
//         behavior: 'smooth',
//       });
//     }
//   }, [messages]);

//   // Connect WebSocket and subscribe
//   useEffect(() => {
//     const connectWebSocket = () => {
//       const sock = new SockJS(`${baseURL}/chat`);
//       const client = Stomp.over(sock);

//       client.connect({}, () => {
//         setStompClient(client);
//         toast.success('Connected to chat');

//         client.subscribe(`/topic/room/${roomId}`, (message) => {
//           const newMessage = JSON.parse(message.body);
//           setMessages((prev) => [...prev, newMessage]);
//         });
//       });
//     };

//     if (connected) {
//       connectWebSocket();
//     }

//     // Cleanup on unmount
//     return () => {
//       if (stompClient) {
//         stompClient.disconnect();
//       }
//     };
//   }, [roomId, connected]);

//   // Send message
//   const sendMessage = () => {
//     if (stompClient && connected && input.trim()) {
//       const message = {
//         sender: currentUser,
//         content: input,
//         roomId,
//       };

//       stompClient.send(`/app/sendMessage/${roomId}`, {}, JSON.stringify(message));
//       setInput('');
//     }
//   };

//   // Logout / Leave room
//   const handleLogout = () => {
//     if (stompClient) stompClient.disconnect();
//     setConnected(false);
//     setRoomId('');
//     setCurrentUser('');
//     navigate('/');
//   };

//   return (
//     <div className="chat-page">
//       {/* Header */}
//       <header className="chat-header">
//         <div>
//           <h1 className="room-name">Room: <span>{roomId}</span></h1>
//         </div>
//         <div>
//           <h1 className="user-name">User: <span>{currentUser}</span></h1>
//         </div>
//         <div>
//           <button onClick={handleLogout} className="leave-button">Leave Room</button>
//         </div>
//       </header>

//       {/* Messages */}
//       <main ref={chatBoxRef} className="chat-main">
//         {messages.map((message, index) => (
//           <div key={index} className="message-container">
//             <p className="message-sender">{message.sender}</p>
//             <p className="message-content">{message.content}</p>
//             {message.timeStamp && (
//               <p className="message-time">{timeAgo(message.timeStamp)}</p>
//             )}
//           </div>
//         ))}
//       </main>

//       {/* Input field */}
//       <div className="message-input-container">
//         <input
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => {
//             if (e.key === 'Enter') sendMessage();
//           }}
//           type="text"
//           className="message-input"
//           placeholder="Type your message here..."
//         />
//         <button onClick={sendMessage} className="send-button">Send</button>
//       </div>
//     </div>
//   );
// };

// export default ChatPage;



