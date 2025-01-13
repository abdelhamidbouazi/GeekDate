import axioss from "axios";

const axios = axioss.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://striking-insight-production.up.railway.app', // Replace with your base URL
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

// export const getAllChannelsUrlEndpoint = "/channel";
// export const getChannelByIdURLEndpoint = (id: string) => `/channel/${id}`;
// export const getDirectMessagesURLEndpoint = (username: string) => `chat/DM/${username}`;

export default  axios;