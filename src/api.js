export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8388/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJlY2V3c0FDRTUiLCJhdXRoIjoiU3VwZXIgQWRtaW4sUkRFIiwiZXhwIjoxNzg3MjQxNDUyLCJuYW1lIjoiRUNFV1MgQUNFNSJ9.cv6-8FHXphk7FbGSAvO-ntfTn1jZeaAbj-Nx1FAhhdhOCY897gCQtnIJPLRMoJ55E6rxwJilOUVZwkuBaeZooA"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8789/websocket"
    : "/websocket";
