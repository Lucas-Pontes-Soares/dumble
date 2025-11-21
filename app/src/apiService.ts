import axios from "axios";

const api = axios.create({
  // baseURL: "http://localhost:3000",
  baseURL: "https://dumble-api-7eebc39b5a82.herokuapp.com",
});

export default api;