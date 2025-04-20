
import axios from 'axios';

const API_URL = 'http://localhost:8000';

export interface SensorData {
  id: string;
  temperature: number;
  humidity: number;
  rssi: number;
  last_updated: string;
}

export const getSensorData = async (): Promise<SensorData[]> => {
  const response = await axios.get(`${API_URL}/sensors/`);
  return response.data;
};

export const addSensorData = async (data: {
  chip_id: string;
  temperature: number;
  humidity: number;
  rssi: number;
}): Promise<void> => {
  await axios.post(`${API_URL}/sensor-data/`, data);
};

export const registerSensor = async (data: {
  chip_id: string;
  user_id: number;
}): Promise<void> => {
  await axios.post(`${API_URL}/register-sensor/`, data);
};
