import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
});

// নোট: এখানে টোকেন ইন্টারসেপ্টর দিচ্ছি না।
// যেখানেই কল করবো, সেখানে হেডারে Authorization সেট করবো।
export default api;
