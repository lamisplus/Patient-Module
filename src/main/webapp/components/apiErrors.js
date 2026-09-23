const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

export const getApiErrorMessage = (error, fallback = FALLBACK_MESSAGE) => {
  const data = error?.response?.data;
  return (
    data?.apierror?.message ||
    data?.message ||
    data?.error ||
    error?.message ||
    fallback
  );
};

export const getApiFieldErrors = (error) => {
  const subErrors = error?.response?.data?.apierror?.subErrors;
  if (!Array.isArray(subErrors)) {
    return {};
  }
  return subErrors.reduce((collected, subError) => {
    if (subError?.field && subError?.message) {
      collected[subError.field] = subError.message;
    }
    return collected;
  }, {});
};

export const hasApiFieldErrors = (error) =>
  Object.keys(getApiFieldErrors(error)).length > 0;
