import { TextEncoder, TextDecoder } from "util";

if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = TextDecoder;
}

global.import = {
  meta: {
    env: {
      VITE_API_URL: "http://localhost:5000",
    },
  },
};


