import axios from "axios";
import axiosInstance from "./axiosInstance";
import { API_URL } from "@/lib/utils";
import { Product } from "@/types";

export const getProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/product/get/`);
    return {
      success: true,
      data: response.data,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: Object.values(error.response.data)[0],
    };
  }
};

export const depositMoney = async (amount: number) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/api/deposit/`, { amount });
    return {
      success: true,
      data: response.data,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: Object.values(error.response.data)[0],
    };
  }
};

export const buyProduct = async (product_id: number, quantity: number) => {
  try {
    const response = await axiosInstance.post(
      `${API_URL}/api/buy/`,
      { product_id, quantity }
    );
    return {
      success: true,
      data: response.data,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: Object.values(error.response.data)[0],
    };
  }
};

export const resetDeposit = async () => {
  try {
    const response = await axiosInstance.post(`${API_URL}/api/reset/`);
    return {
      success: true,
      data: response.data,
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: Object.values(error.response.data)[0],
    };
  }
}

export const addProduct = async (product: Product) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/api/product/`, product);
    return {
      success: true,
      data: response.data,
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: Object.values(error.response.data)[0],
    };
  }
}

export const resetBalance = async () => {
  try {
    const response = await axiosInstance.post(`${API_URL}/api/reset/`);
    return {
      success: true,
      data: response.data,
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: Object.values(error.response.data)[0],
    };
  }
}

export const updateProduct = async (product: Product) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/api/product/${product.id}/`, product);
    return {
      success: true,
      data: response.data,
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: Object.values(error.response.data)[0],
    };
  }
}

export const deleteProduct = async (product_id: number) => {
  try {
    const response = await axiosInstance.delete(`${API_URL}/api/product/${product_id}/`);
    return {
      success: true,
      data: response.data,
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: Object.values(error.response.data)[0],
    };
  }
}

export const getActiveSessions = async () => {
  try {
    const response = await axiosInstance.get(`${API_URL}/api/active-sessions/`);
    return {
      success: true,
      data: response.data,
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: Object.values(error.response.data)[0],
    };
  }
}

export const logout = async () => {
  try {
    const response = await axiosInstance.post(`${API_URL}/api/logout/`);
    return {
      success: true,
      data: response.data,
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: Object.values(error.response.data)[0],
    };
  }
} 

export const logoutAll = async () => {
  try {
    const response = await axiosInstance.post(`${API_URL}/api/logout/all/`);
    return {
      success: true,
      data: response.data,
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: Object.values(error.response.data)[0],
    };
  }
}

