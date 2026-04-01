import axios from 'axios';
import { API_ROOT } from '../config/apiConfig';

const httpClient = axios.create({
  baseURL: API_ROOT,
  timeout: 30000,
});

export default httpClient;
