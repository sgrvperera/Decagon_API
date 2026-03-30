export interface AuthConfig {
  type: 'none' | 'bearer' | 'basic' | 'apikey';
  token?: string;
  username?: string;
  password?: string;
  apiKey?: string;
  headerName?: string;
}

export class AuthHandler {
  private authConfig: AuthConfig;

  constructor(authConfig: AuthConfig = { type: 'none' }) {
    this.authConfig = authConfig;
  }

  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    switch (this.authConfig.type) {
      case 'bearer':
        if (this.authConfig.token) {
          headers['Authorization'] = `Bearer ${this.authConfig.token}`;
        }
        break;
      case 'basic':
        if (this.authConfig.username && this.authConfig.password) {
          const encoded = Buffer.from(`${this.authConfig.username}:${this.authConfig.password}`).toString('base64');
          headers['Authorization'] = `Basic ${encoded}`;
        }
        break;
      case 'apikey':
        if (this.authConfig.apiKey && this.authConfig.headerName) {
          headers[this.authConfig.headerName] = this.authConfig.apiKey;
        }
        break;
    }

    return headers;
  }

  setToken(token: string) {
    this.authConfig.token = token;
  }
}
