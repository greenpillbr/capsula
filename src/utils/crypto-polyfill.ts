import { Platform } from 'react-native';

// Web crypto polyfill setup
if (Platform.OS === 'web') {
  // Ensure crypto.getRandomValues is available
  if (typeof global !== 'undefined' && !global.crypto) {
    global.crypto = require('crypto').webcrypto;
  }
  
  // Polyfill for Buffer if not available
  if (typeof global !== 'undefined' && !global.Buffer) {
    global.Buffer = require('buffer').Buffer;
  }
  
  // Setup random values polyfill
  if (typeof global !== 'undefined' && !global.crypto?.getRandomValues) {
    const crypto = require('crypto');
    global.crypto = {
      ...global.crypto,
      getRandomValues: (arr: any) => {
        const bytes = crypto.randomBytes(arr.length);
        for (let i = 0; i < arr.length; i++) {
          arr[i] = bytes[i];
        }
        return arr;
      }
    };
  }
}

export { };

