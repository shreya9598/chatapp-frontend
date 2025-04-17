import React, { useEffect, useRef, useState } from 'react';
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { baseURL } from "../config/AxiosHelper";
import { getMessagess } from "../services/RoomService";
import { timeAgo } from '../util/dateUtil';
import '../styles/ChatPage.css';


const ChatPage = () => {
  const { roomId, currentUser, connected, setConnected, setRoomId, setCurrentUser } = useChatContext();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const chatBoxRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    if (!connected) {
      navigate("/");
    }
  }, [connected, roomId, currentUser]);

  useEffect(() => {
    async function loadMessages() {
      try {
        const messages = await getMessagess(roomId);
        setMessages(messages);
      } catch (error) {}
    }
    if (connected) {
      loadMessages();
    }
  }, [roomId, connected]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scroll({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    const connectWebSocket = () => {
      const sock = new SockJS(`${baseURL}/chat`);
      const client = Stomp.over(sock);

      client.connect({}, () => {
        setStompClient(client);
        toast.success("Connected to chat!");

        client.subscribe(`/topic/room/${roomId}`, (message) => {
          const newMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, newMessage]);
        });
      });
    };

    if (connected) {
      connectWebSocket();
    }

    return () => {
      if (stompClient) {
        stompClient.disconnect();
      }
    };
  }, [roomId, connected]);

  const sendMessage = async () => {
    if (stompClient && connected && input.trim()) {
      const message = {
        sender: currentUser,
        content: input,
        roomId: roomId,
      };

      stompClient.send(`/app/sendMessage/${roomId}`, {}, JSON.stringify(message));
      setInput("");
    }
  };

  const handleLogout = () => {
    stompClient.disconnect();
    setConnected(false);
    setRoomId("");
    setCurrentUser("");
    navigate("/");
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <header className="chat-header">
        <div>
          <h1 className="room-name">Room: <span>{roomId}</span></h1>
        </div>
        <div>
          <h1 className="user-name">User: <span>{currentUser}</span></h1>
        </div>
        <div>
          <button onClick={handleLogout} className="leave-button">Leave Room</button>
        </div>
      </header>

      {/* Messages */}
      <main ref={chatBoxRef} className="chat-main">
        {messages.map((message, index) => (
          <div key={index} className="message-container">
            <p className="message-sender">{message.sender}</p>
            <p className="message-content">{message.content}</p>
            <p className="message-time">{timeAgo(message.timeStamp)}</p>
          </div>
        ))}
      </main>

      {/* Input Section */}
      <div className="message-container input-container">
        <div className="message">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            type="text"
            className="message-input"
            placeholder="Type your message here..."
          />
          <button onClick={sendMessage} className="send-button">Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
