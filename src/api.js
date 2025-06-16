export const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8383/api/v1/'
    : '/api/v1/';
export const token =
  process.env.NODE_ENV === 'development'
    ? 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzQ5NzgzNDQ4fQ.W913lJzTxGvwlJUXUcd8BWZmBjyqTDgfP9ASifQD3XGJ7JTxYhMAGdFska2ABun_xonLDObeADEHvCxOoHXEHg'
    : new URLSearchParams(window.location.search).get('jwt');

export const wsUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8789/websocket'
    : '/websocket';
