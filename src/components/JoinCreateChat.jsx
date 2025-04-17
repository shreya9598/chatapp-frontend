import React, { useState } from 'react'
import toast from "react-hot-toast";
import { createRoomApi, joinChatApi } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";

function JoinCreateChat() {

    const [detail, setDetail] = useState({
        roomId: "",
        userName: ""
    });

    const { roomId, userName, setRoomId, setCurrentUser, setConnected } = useChatContext();

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
            toast.success("joined..");
            setCurrentUser(detail.userName);
            setRoomId(room.roomId);
            setConnected(true);
            navigate("/chat");
          } catch (error) {
            if (error.status == 400) {
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
                roomId: detail.roomId
            });
            console.log(response);
            toast.success("Room Created Successfully !!");
            //join the room
            setCurrentUser(detail.userName);
            setRoomId(response.roomId);
            setConnected(true);
    
            navigate("/chat");
    
            //forward to chat page...
          } catch (error) {
            console.log(error);
            if (error.status == 400) {
              toast.error("Room  already exists !!");
            } else {
              toast("Error in creating room");
            }
          }
    }
    

  return (
    <div className='flex items-center justify-center border h-screen'>
        <div className='border'>
            <h1 className='join-create-room'>Join/Create Room</h1>
        </div>

        {/* name div */}
        <div className=''>
            <label htmlFor="name" className=''>Your Name</label>
            <input onChange = {handleFormInputChange} value={detail.userName} type="text" id='name' name='userName' placeholder='Enter the name' className='' />
        </div>

        {/*room id div  */}
        <div className=''>
            <label htmlFor="name" className=''>Room ID</label>
            <input name = "roomId" onChange = {handleFormInputChange} value = {detail.roomId} type="text" id='name' className='' />
        </div>

        {/* Button div */}
        <div className=''>
            <button onClick = {joinChat} className=''>Join Room</button>
            <button onClick = {createRoom} className=''>Create Room</button>
        </div>
    </div>
  )
}

export default JoinCreateChat