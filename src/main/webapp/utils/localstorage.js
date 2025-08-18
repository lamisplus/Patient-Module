import axios from "axios";
import { token, url } from "../../../api";

export const getStorageValues = (keys) => {
  try {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    const values = keyArray.reduce((acc, key) => {
      const value = localStorage.getItem(key);
      try {
        acc[key] =
          value && (value.startsWith("[") || value.startsWith("{"))
            ? JSON.parse(value)
            : value;
      } catch {
        acc[key] = value;
      }
      return acc;
    }, {});
    return keyArray.length === 1 ? values[keys] : values;
  } catch (error) {
    console.error("Error accessing localStorage:", error);
    return Array.isArray(keys) ? {} : null;
  }
};

export const fetchAndStoreAccountData = async () => {
  try {
    const response = await axios.get(`${url}account`, {
      headers: { Authorization: `Bearer ${token}` },
    });


    localStorage.setItem("user_account", JSON.stringify(response.data));
    localStorage.setItem(
      "currentUser_Roles",
      JSON.stringify(response.data.roles)
    );
    localStorage.setItem(
      "currentUser_Permission",
      JSON.stringify(response.data.permissions)
    );

    return {
      user_account: response.data,
      currentUser_Roles: response.data.roles,
      currentUser_Permission: response.data.permissions,
    };
  } catch (error) {
    console.error("Error fetching account data:", error);
    return null;
  }
};

export const getFacilityId = () => {
  const userAccount = getStorageValues("user_account");
  return userAccount?.currentOrganisationUnitId || null;
};

export const getPermissions = async () => {
  try {
    const permissions = getStorageValues("currentUser_Permission");
    if (!permissions) {
      const data = await fetchAndStoreAccountData();
      return Array.isArray(data?.currentUser_Permission)
        ? data.currentUser_Permission
        : [];
    }
    return Array.isArray(permissions) ? permissions : [];
  } catch (error) {
    console.error("Error getting permissions:", error);
    return [];
  }
};

export const getRoles = async () => {
  const roles = getStorageValues("currentUser_Roles");
  if (!roles) {
    const data = await fetchAndStoreAccountData();
    return data?.currentUser_Roles;
  }
  return roles;
};