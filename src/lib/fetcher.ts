import axios from "axios";
import {apiConfig} from "../config/api";

export const fetcher = axios.create({
  baseURL: apiConfig.host,
});
