import axios from "axios";

const VMA_API_ADDRESS = process.env.NEXT_PUBLIC_VMA_API_ADDRESS;

export const api = axios.create({ baseURL: VMA_API_ADDRESS });
