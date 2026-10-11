export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8789/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluLFVzZXIsUkRFIiwiZXhwIjoxNzkxNzc1MTQ0LCJuYW1lIjoiR3Vlc3QgR3Vlc3QifQ.2jchK3HAB9F-WsuTvXP8dfkUrogZ7GPcPTT2HUxvtrneOkk9TlarlagUI8ZCDl33gGc6TzOdx3MbrRF6CU3wfw"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8789/websocket"
    : "/websocket";
