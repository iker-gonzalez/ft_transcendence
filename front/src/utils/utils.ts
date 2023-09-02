export function getBaseUrl() {
    return window.location.hostname === 'localhost' ? `http://localhost:${process.env.REACT_APP_API_PORT}`: 'https://' + window.location.hostname.replace('4200', '3000');
}

