export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8388/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzUyNzkxNjgyfQ.5TTTrkxeY8aCILcguERQOEUdJEIgYXujlx6AesYMoXJSWMuGiLrTx2vYntMgVVaSGM30dVn5xoeNuq0mIU33zA"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8789/websocket"
    : "/websocket";
