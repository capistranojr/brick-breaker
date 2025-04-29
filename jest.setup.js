// Mock canvas
class MockCanvas {
  getContext() {
    return {
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      closePath: jest.fn(),
      rect: jest.fn(),
      save: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      restore: jest.fn(),
      shadowBlur: 0,
      shadowColor: '',
      fillStyle: '',
      lineWidth: 0,
      strokeStyle: '',
      stroke: jest.fn()
    };
  }
}

// Mock HTML elements
document.getElementById = jest.fn().mockImplementation((id) => {
  if (id === 'gameCanvas') {
    const canvas = new MockCanvas();
    canvas.width = 800;
    canvas.height = 600;
    canvas.offsetWidth = 800;
    canvas.offsetHeight = 600;
    canvas.getBoundingClientRect = jest.fn().mockReturnValue({
      left: 0,
      top: 0
    });
    canvas.addEventListener = jest.fn();
    return canvas;
  }
  
  const element = {
    style: {},
    textContent: '',
    innerHTML: '',
    appendChild: jest.fn(),
    addEventListener: jest.fn(),
    classList: {
      add: jest.fn(),
      remove: jest.fn()
    }
  };
  return element;
});

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock requestAnimationFrame
window.requestAnimationFrame = jest.fn(callback => setTimeout(callback, 0));
window.cancelAnimationFrame = jest.fn();

// Mock Audio
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn().mockResolvedValue(),
  pause: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  src: '',
  volume: 0
}));

// Mock AudioContext
global.AudioContext = jest.fn().mockImplementation(() => ({
  createOscillator: jest.fn().mockReturnValue({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: {
      value: 0,
      linearRampToValueAtTime: jest.fn()
    }
  }),
  createGain: jest.fn().mockReturnValue({
    connect: jest.fn(),
    gain: {
      value: 0
    }
  }),
  currentTime: 0,
  destination: {}
}));

// Mock document.createElement
document.createElement = jest.fn().mockImplementation(tag => {
  if (tag === 'div') {
    return {
      style: {},
      className: '',
      textContent: '',
      appendChild: jest.fn(),
      remove: jest.fn()
    };
  }
  if (tag === 'li') {
    return {
      textContent: '',
      appendChild: jest.fn()
    };
  }
  if (tag === 'span') {
    return {
      textContent: ''
    };
  }
  return {};
});

// Mock document.querySelector
document.querySelector = jest.fn().mockImplementation(() => ({
  appendChild: jest.fn()
}));
