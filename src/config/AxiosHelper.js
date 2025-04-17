import axios from "axios";
export const baseURL = "http://localhost:8005";
export const httpClient = axios.create({
  baseURL: baseURL,
});