import axios from 'axios';

const DOMAIN = process.env.REACT_APP_PRODUCT_BASE_URL;

export const request = async (method, url, data) => {
    try {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        if (method.toUpperCase() === 'GET' && data) {
            headers['X-User-ID'] = data;
        }

        const response = await axios({
            method: method,
            url: `${DOMAIN}${url}`,
            data: method.toUpperCase() !== 'GET' ? data : undefined,
            headers: headers
        });
        return response.data;
    } catch (error) {
        console.error('API request 에러: ', error);
        throw error;
    }
};

export const multipartRequest = async (method, url, data) => {
    try {
        const response = await axios({
            method: method,
            url: `${DOMAIN}${url}`,
            data: data,
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': '*/*'
            }
        });
        return response.data;
    } catch (error) {
        console.error('API request 에러: ', error);
        throw error;
    }
};


  