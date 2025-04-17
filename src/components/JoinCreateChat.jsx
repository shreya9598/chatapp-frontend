import React, { useState } from 'react';
import toast from "react-hot-toast";
import { createRoomApi, joinChatApi } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import '../styles/JoinCreateChat.css';

function JoinCreateChat() {
  const [detail, setDetail] = useState({
    roomId: "",
    userName: ""
  });

  const { setRoomId, setCurrentUser, setConnected } = useChatContext();
  const navigate = useNavigate();

  function handleFormInputChange(event) {
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    });
  }

  function validateForm() {
    if (detail.roomId === "" || detail.userName === "") {
      toast.error("Invalid Input !!");
      return false;
    }
    return true;
  }

  async function joinChat() {
    if (!validateForm()) return;

    try {
      const room = await joinChatApi(detail.roomId);
      toast.success("Joined room successfully!");
      setCurrentUser(detail.userName);
      setRoomId(room.roomId);
      setConnected(true);
      navigate("/chat");
    } catch (error) {
      if (error.status === 400) {
        toast.error(error.response.data);
      } else {
        toast.error("Error in joining room");
      }
      console.log(error);
    }
  }

  async function createRoom() {
    if (!validateForm()) return;

    try {
      const response = await createRoomApi({
        roomId: detail.roomId,
      });
      toast.success("Room Created Successfully!");
      setCurrentUser(detail.userName);
      setRoomId(response.roomId);
      setConnected(true);
      navigate("/chat");
    } catch (error) {
      console.log(error);
      if (error.status === 400) {
        toast.error("Room already exists!");
      } else {
        toast.error("Error in creating room");
      }
    }
  }

  return (
    <div className="container">
      <div className="form-box">
        <h1 className="form-title">Join or Create a Room</h1>

        <div className="form-group">
          {/* <label htmlFor="userName">Your Name</label> */}
          <input
            onChange={handleFormInputChange}
            value={detail.userName}
            type="text"
            id="userName"
            name="userName"
            placeholder="Enter your name"
          />
        </div>

        <div className="form-group">
          {/* <label htmlFor="roomId">Room ID</label> */}
          <input
            onChange={handleFormInputChange}
            value={detail.roomId}
            type="text"
            id="roomId"
            name="roomId"
            placeholder="Enter room ID"
          />
        </div>

        <div className="button-group">
          <button onClick={joinChat} className="btn btn-join">Join Room</button>
          <button onClick={createRoom} className="btn btn-create">Create Room</button>
        </div>
      </div>
    </div>
  );
}

export default JoinCreateChat;
