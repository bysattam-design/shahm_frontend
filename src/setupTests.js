// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Axios publishes ESM that CRA 5's Jest 27 resolver cannot transform. Tests
// exercise the application boundary with a deterministic client instead of
// performing network requests.
jest.mock("axios", () => {
  const response = { data: {} };
  const client = jest.fn(() => Promise.resolve(response));
  client.get = jest.fn(() => Promise.resolve(response));
  client.post = jest.fn(() => Promise.resolve(response));
  client.put = jest.fn(() => Promise.resolve(response));
  client.patch = jest.fn(() => Promise.resolve(response));
  client.delete = jest.fn(() => Promise.resolve(response));
  client.interceptors = {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  };

  return {
    __esModule: true,
    default: { create: jest.fn(() => client) },
    create: jest.fn(() => client),
  };
});

jest.mock("suneditor-react", () => ({
  __esModule: true,
  default: () => <div data-testid="rich-text-editor" />,
}));

jest.mock("sweetalert2", () => ({
  __esModule: true,
  default: { fire: jest.fn(() => Promise.resolve({ isConfirmed: true })) },
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    // i18next takes either a string fallback or a bag of values to interpolate.
    // Returning the bag itself put an object where a React child belonged, so a
    // screen that counted anything could not be rendered in a test at all.
    t: (key, second) => {
      if (typeof second === "string") return second;

      if (second && typeof second === "object") {
        return Object.entries(second).reduce(
          (text, [name, value]) =>
            text.replace(new RegExp(`{{\\s*${name}\\s*}}`, "g"), String(value)),
          key
        );
      }

      return key;
    },
    i18n: {
      language: "en",
      changeLanguage: jest.fn(() => Promise.resolve()),
    },
  }),
}));
