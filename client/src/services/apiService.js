import axios from "axios";

export const generateStudyGuide = async (file) => {
  const apiUrl = (
    import.meta.env.VITE_API_BASE_URL?.trim() || "/api/v1"
  ).replace(/\/+$/, "");
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(`${apiUrl}/generate`, formData, {
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
