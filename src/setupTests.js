import '@testing-library/jest-dom';

// Polyfill para Node 16 (TextEncoder no es global hasta Node 19+)
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock para window.matchMedia (JSDOM no lo implementa)
window.matchMedia = window.matchMedia || function matchMediaMock(query) {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: function () {},
    removeListener: function () {},
    addEventListener: function () {},
    removeEventListener: function () {},
    dispatchEvent: function () {},
  };
};

// Mock para ResizeObserver (JSDOM no lo implementa)
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = window.ResizeObserver || ResizeObserverMock;
