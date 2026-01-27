import axios from "./anxios";

export const segmentTextAPI = async (text, title) => {
  return axios.post("/materials/segment/", { text, title });
};

export const summarizeAPI = async (text, materialId) => {
  return axios.post("/materials/summarize/", { text, material_id: materialId });
};

export const getHistoryAPI = async () => {
  return axios.get("/materials/history/");
};

export const getMaterialDetailsAPI = async (materialId) => {
  return axios.get(`/materials/${materialId}/`);
};

export const getEducationalInsightsAPI = async (materialId) => {
  return axios.get(`/materials/${materialId}/insights/`);
};

