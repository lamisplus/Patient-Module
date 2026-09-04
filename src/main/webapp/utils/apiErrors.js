const CONFIGURATION_HINTS =
  /credential|username|password|api\s*key|secret|token|unauthori[sz]ed|not\s+configured|misconfigur|configuration|base\s*url|endpoint|connection\s+refused|unknown\s*host|timed?\s*out/i;

export const PIMS_NOT_CONFIGURED_TITLE = "PIMS is not properly configured";

const readServerMessage = (data) => {
  if (!data) return "";
  if (typeof data === "string") return data.trim();
  const { message } = data;
  if (typeof message === "string") return message.trim();
  if (message && typeof message === "object") {
    const nested = message.ERROR || message.WARNING || message.INFO;
    if (typeof nested === "string") return nested.trim();
  }
  if (typeof data.error === "string") return data.error.trim();
  if (typeof data.detail === "string") return data.detail.trim();
  if (data.apierror && typeof data.apierror.message === "string") {
    return data.apierror.message.trim();
  }
  return "";
};

export const getResponseMessage = (data) => readServerMessage(data);

export const getServerMessage = (error) =>
  readServerMessage(error && error.response ? error.response.data : null);

export const getApiErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again."
) => {
  if (!error) return fallback;
  const serverMessage = getServerMessage(error);
  if (!error.response) {
    if (error.code === "ECONNABORTED") {
      return "The request took too long to complete. Please check your network and try again.";
    }
    return "Unable to reach the server. Please check your network or confirm the service is running, then try again.";
  }
  const status = error.response.status;
  if (status === 400 || status === 422) {
    return serverMessage || "The server rejected this request. Please review the details and try again.";
  }
  if (status === 401 || status === 403) {
    return (
      serverMessage ||
      "You are not authorised to perform this action. Please sign in again or contact your administrator."
    );
  }
  if (status === 404) {
    return serverMessage || "The record or service being requested was not found on the server.";
  }
  if (status === 409) {
    return serverMessage || "This record conflicts with an existing one on the server.";
  }
  if (status >= 500) {
    return serverMessage
      ? `The server ran into a problem: ${serverMessage}`
      : "The server ran into a problem completing this request. Please try again or contact your administrator.";
  }
  return serverMessage || fallback;
};

const notConfiguredAlert = (message) => ({
  severity: "error",
  title: PIMS_NOT_CONFIGURED_TITLE,
  configuration: true,
  message,
});

export const getPimsErrorAlert = (error) => {
  const serverMessage = getServerMessage(error);
  if (!error || !error.response) {
    return notConfiguredAlert(
      "The PIMS server could not be reached. Confirm with your administrator that the PIMS server address is configured for this facility and that the server is online."
    );
  }
  const status = error.response.status;
  if (status === 401 || status === 403) {
    return notConfiguredAlert(
      `PIMS rejected the credentials saved on this server${
        serverMessage ? `: ${serverMessage}` : "."
      } Ask your administrator to update the PIMS username, password or API key.`
    );
  }
  if (status === 404) {
    return notConfiguredAlert(
      "The PIMS verification service was not found on this server. The PIMS integration has not been set up for this facility."
    );
  }
  if (status >= 500 || CONFIGURATION_HINTS.test(serverMessage)) {
    return notConfiguredAlert(
      serverMessage
        ? `PIMS could not complete the check: ${serverMessage}. Please ask your administrator to review the PIMS setup.`
        : "PIMS could not complete the check because the integration returned a server error. Please ask your administrator to review the PIMS setup."
    );
  }
  return {
    severity: "warning",
    title: "PIMS could not verify this fingerprint",
    configuration: false,
    message:
      serverMessage || "PIMS rejected the request. Please rescan the finger and try again.",
  };
};

export const getPimsConfigAlert = (data) => {
  const message = readServerMessage(data);
  if (!CONFIGURATION_HINTS.test(message)) return null;
  return notConfiguredAlert(
    `${message}. Please ask your administrator to review the PIMS setup.`
  );
};
