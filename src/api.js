export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8388/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJlY2V3c0FDRTUiLCJhdXRoIjoiU3VwZXIgQWRtaW4sRGF0YSBDbGVyayxVc2VyLFJERSIsImV4cCI6MTc4ODg5NzQ3MCwibmFtZSI6IkVDRVdTIEFDRTUifQ.FUniG8Yz1PwKATplcvuHcyOYt6zshqdVclrdIE2G4ve6s4UkYD6_Qcx5e_qeFITSk_Wf9UJq8-KSxk9IPsqWfA"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8789/websocket"
    : "/websocket";
