import axios from "axios";
import { BACKEND_BASE_URL } from "src/config/constants";

export const backendApi = axios.create({
    baseURL: BACKEND_BASE_URL,
});
