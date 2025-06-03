import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { token, url as baseUrl } from "../../../../api";

const useCodesets = (codesetKeys) => {
  const [codesets, setCodesets] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCodesets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${baseUrl}application-codesets/v2/codeSets`,
        {
          params: { codes: codesetKeys },
          paramsSerializer: (params) =>
            params.codes
              .map((code) => `codes=${encodeURIComponent(code)}`)
              .join("&"),
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const sortedCodesets = {};
      Object.keys(response.data).forEach((key) => {
        sortedCodesets[key] = response.data[key].sort((a, b) =>
          a.display.localeCompare(b.display)
        );
      });

      setCodesets(sortedCodesets);
    } catch (err) {
      setError(err);
      console.error("Error loading codesets:", err);
    } finally {
      setLoading(false);
    }
  }, [codesetKeys]);

  useEffect(() => {
    if (codesetKeys.length > 0) {
      loadCodesets();
    }
  }, [loadCodesets]);

  const getOptions = useCallback(
    (codesetKey) => {
      return codesets[codesetKey] || [];
    },
    [codesets]
  );

  return { codesets, loading, error, getOptions, refetch: loadCodesets };
};

export default useCodesets;