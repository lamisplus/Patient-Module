import { useState, useEffect, useMemo } from "react";
import { getStorageValues, fetchAndStoreAccountData } from "../utils/localstorage";

export const useUserAccount = () => {
  const [userAccount, setUserAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserAccount = async () => {
      try {
        let account = getStorageValues("user_account");

        // If not in localStorage, fetch from API
        if (!account) {
          const data = await fetchAndStoreAccountData();
          account = data?.user_account || null;
        }

        setUserAccount(account);
      } catch (error) {
        console.error("Error loading user account:", error);
        setUserAccount(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserAccount();
  }, []);

  const accountData = useMemo(() => {
    if (!userAccount) {
      return {
        facilities: [],
        currentFacility: null,
        currentFacilityId: null,
        currentFacilityName: null,
        user: null,
      };
    }

    return {
      facilities: userAccount.applicationUserOrganisationUnits || [],
      currentFacility: userAccount.applicationUserOrganisationUnits?.[0] || null,
      currentFacilityId: userAccount.currentOrganisationUnitId || null,
      currentFacilityName: userAccount.currentOrganisationUnitName || null,
      user: {
        id: userAccount.id,
        userName: userAccount.userName,
        firstName: userAccount.firstName,
        lastName: userAccount.lastName,
        email: userAccount.email,
        phoneNumber: userAccount.phoneNumber,
        designation: userAccount.designation,
      },
      fullAccount: userAccount,
    };
  }, [userAccount]);

  return { ...accountData, loading };
};
