export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8789/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJsYWd0ZW5AZ21haWwuY29tIiwiYXV0aCI6IlVzZXIsRGF0YSBlbnRyeSBjbGVyayIsIm5hbWUiOiJKdWRlIFRlc3RpbmciLCJleHAiOjE3NjQwODAzMTl9.iMpnXLzGBi4QRdV-5wb1McTH3FRjduirJGvdBz5eCzcKpSSjnII5IQ54riMLShDzh8vcfjLR4cF_rr7xhlCVhA"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8789/websocket"
    : "/websocket";
