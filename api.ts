import axios from "axios";

export const wenderApi = axios.create({
  baseURL: "https://api.gograb.hamidlab.com/wender",
  headers: {
    "Content-type": "application/json",
  },
});
