export const GOOGLE_MAPS_API_KEY = 'AIzaSyBR3XR176Wj4TBWWcH2qY_tungtmqpofVw';

export const MAP_STYLES = {
  height: "100vh",
  width: "100%"
};

export const MAP_ICONS = {
  user: {
    url: "data:image/svg+xml;base64," + btoa(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="2"/>
      </svg>
    `),
    scaledSize: { width: 24, height: 24 },
    anchor: { x: 12, y: 12 }
  },
  facility: {
    url: "data:image/svg+xml;base64," + btoa(`
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 2C10.48 2 6 6.48 6 12C6 19.25 16 30 16 30C16 30 26 19.25 26 12C26 6.48 21.52 2 16 2ZM16 15C14.34 15 13 13.66 13 12C13 10.34 14.34 9 16 9C17.66 9 19 10.34 19 12C19 13.66 17.66 15 16 15Z" fill="#4285F4"/>
      </svg>
    `),
    scaledSize: { width: 32, height: 32 },
    anchor: { x: 16, y: 32 }
  }
};