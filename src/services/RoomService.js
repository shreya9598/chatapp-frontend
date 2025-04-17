import { httpClient } from "../config/AxiosHelper";

export const createRoomApi = async (roomDetail) => {
  const respone = await httpClient.post(`/rooms`, roomDetail, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return respone.data;
};

export const joinChatApi = async (roomId) => {
  const response = await httpClient.get(`/rooms/${roomId}`);
  return response.data;
};

export const getMessagess = async (roomId) => {
  const response = await httpClient.get(
    `/rooms/${roomId}/messages`
  );
  return response.data;
};