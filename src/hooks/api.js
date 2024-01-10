import axios from "axios"

const BASE_URL = 'https://market.sevensport.com.ar/api/batchs'

export const postApi = async (data) => {
    try {
        const response = await axios.post(`${BASE_URL}/create`, data);
        return response.data
    } catch (error) {
        throw error
    }
};

export const getApi = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/orders-pending`);
        return response.data
    } catch (error) {
        throw error
    }
}