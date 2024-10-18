import axios from "axios";
import { API_URL } from "@/lib/utils";
import axiosInstance from "./axiosInstance";

export const login = async (username: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/api/signin/`, {
      username,
      password,
    });
    return {
      success: true,
      data: response.data,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) { // error has to be either any or unknown
    console.log(error, 'the login error')
    return {
      success: false,
      message: Object.values(error.response.data)[0],
    };
  }
};

export const signup = async (username: string, password: string, role: string) => {
  try {
    const response = await axios.post(`${API_URL}/api/user/`, {
      username,
      password,
      role,
    });

    return {
      success: true,
      data: response.data,
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch (error: any) {
    console.log(error, 'the signup error')
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
    };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return {
      success: false,
      message: Object.values(error.response.data)[0],
    };
  }
};
