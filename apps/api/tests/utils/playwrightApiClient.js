const { request } = require("@playwright/test");

class PlaywrightApiClient {
  constructor(baseURL = "http://localhost:5000") {
    this.baseURL = baseURL;
    this.context = null;
  }

  async init() {
    this.context = await request.newContext({
      baseURL: this.baseURL,
    });
    return this;
  }

  async dispose() {
    if (this.context) {
      await this.context.dispose();
    }
  }

  authHeader(token) {
    return { Authorization: `Bearer ${token}` };
  }

  async get(url, token = null) {
    const headers = token ? this.authHeader(token) : {};
    return await this.context.get(url, { headers });
  }

  async post(url, data, token = null) {
    const headers = token ? this.authHeader(token) : {};
    return await this.context.post(url, {
      headers,
      data,
    });
  }

  async put(url, data, token = null) {
    const headers = token ? this.authHeader(token) : {};
    return await this.context.put(url, {
      headers,
      data,
    });
  }

  async delete(url, token = null) {
    const headers = token ? this.authHeader(token) : {};
    return await this.context.delete(url, { headers });
  }
}

module.exports = { PlaywrightApiClient };
