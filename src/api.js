export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8789/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluLFVzZXIiLCJuYW1lIjoiR3Vlc3QgR3Vlc3QiLCJleHAiOjE3NzA4MjgzMDR9.VgxeauoLZ5bgYbkw3qBONPFJEhcvI9aUSorOXsk9wtTRrEWDIP3faWE6wM9Ib2N_DMAr5Tg_3ZxNCt9RE2RDbw"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8789/websocket"
    : "/websocket";
