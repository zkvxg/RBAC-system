const { request } = require("@playwright/test");

// klient api playwright z obsluga autentykacji jwt
class PlaywrightApiClient {
  constructor(baseURL = "http://localhost:5000") {
    this.baseURL = baseURL;
    this.context = null;
  }

  // inicjalizacja kontekstu request
  async init() {
    this.context = await request.newContext({
      baseURL: this.baseURL,
    });
    return this;
  }

  // zamkniecie kontekstu po testach
  async dispose() {
    if (this.context) {
      await this.context.dispose();
    }
  }

  // helper do dodawania headera authorization
  authHeader(token) {
    return { Authorization: `Bearer ${token}` };
  }

  // metoda get z opcjonalnym tokenem
  async get(url, token = null) {
    const headers = token ? this.authHeader(token) : {};
    return await this.context.get(url, { headers });
  }

  // metoda post z opcjonalnym tokenem
  async post(url, data, token = null) {
    const headers = token ? this.authHeader(token) : {};
    return await this.context.post(url, {
      headers,
      data,
    });
  }

  // metoda put z opcjonalnym tokenem
  async put(url, data, token = null) {
    const headers = token ? this.authHeader(token) : {};
    return await this.context.put(url, {
      headers,
      data,
    });
  }

  // metoda delete z opcjonalnym tokenem
  async delete(url, token = null) {
    const headers = token ? this.authHeader(token) : {};
    return await this.context.delete(url, { headers });
  }
}

module.exports = { PlaywrightApiClient };
