import axios from "axios";

export const wenderApi = axios.create({
  baseURL: "https://api.gograb.hamidlab.com/wender",
  headers: {
    "Content-type": "application/json",
  },
});

export const functionApi = axios.create({
  baseURL: "https://us-central1-go-grab-13dac.cloudfunctions.net",
  headers: {
    "Content-type": "application/json",
  },
});

export const api = axios.create({
  baseURL: "https://api.gograb.hamidlab.com/api",
  headers: {
    "Content-type": "application/json",
  },
});
