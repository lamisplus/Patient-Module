export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8789/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluLFVzZXIsUkRFIiwiZXhwIjoxNzkxOTE2MjYzLCJuYW1lIjoiR3Vlc3QgR3Vlc3QifQ.JwtPLurUt0lEHT_aWmpOaj7e3gwiVXP7I5oRqrSTdbGM3szUZ7P1qEJKkjLuzOC38ZzlD7KYrYWS8HpuDvFZzA"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8789/websocket"
    : "/websocket";
