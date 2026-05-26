import OpenAI from "openai";

const client = new OpenAI({

  baseURL:
    "https://integrate.api.nvidia.com/v1",

  apiKey:
    process.env.NVIDIA_API_KEY,

});

export default client;