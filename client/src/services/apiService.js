import axios from "axios";

const API_URL = (
  import.meta.env.VITE_API_BASE_URL?.trim() || "/api/v1"
).replace(/\/+$/, "");

export const generateStudyGuide = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(`${API_URL}/generate`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message, { cause: error });
    }
    throw new Error(error.message || "Network Error", { cause: error });
  }
};
