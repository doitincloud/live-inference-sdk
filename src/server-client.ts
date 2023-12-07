
import { Base } from './base';
import isInBrowser from './is-in-browser';
import type * as types from './types';

export class ServerClient extends Base {

    constructor({apiKey, type, expiresAt, ...options} : types.ClientCreateOptions) {
        super();
        if (isInBrowser()) {
            throw new Error('server client can not instantiated in browser');
        }
        if (!apiKey && options.key) {
            apiKey = options.key;
        }
        if (!apiKey) {
            throw new Error('api key is required for server client');
        } else {
            if (!apiKey.startsWith('api-')) {
              throw new Error('api key must start with api- for server client');
            }
        }
        if (!type) {
            type = 'api-key';
          } else if (type !== 'api-key') {
            throw new Error('api key info must be of type api-key for server client');
        }
        if (!expiresAt && options.expires_at) {
            expiresAt = options.expires_at;
        }
        if (!expiresAt || options.expires) {
            expiresAt = new Date(options.expires * 1000);
        }
        if (expiresAt === undefined) {
            this. updateKeyInfoFromServer(apiKey, type);
        } else {
            this.updateKeyInfo({key: apiKey, type, expires_at: expiresAt, ...options});
        }
    }

    public async createSession(options : types.KeyCreateOptions = {}) : Promise<{data: types.ExKeyInfoOptions, error: any}> {
        return await this.request('/api/v1/auth/session-key', { body: options });
    }

    public async deleteSession(key: string) : Promise<types.StatusInfo> {
        if (!key.startsWith('ses-')) {
            throw new Error('session key must start with ses-');
        }
        return await this.request('/api/v1/auth/delete/' + key);
    }

    public async setParams(data : any) : Promise<any> {
        return await this.request('/api/v1/params', { method: 'POST', body: data});
    }

    public async getParams() : Promise<any> {
        return await this.request('/api/v1/params');
    }

    public async updateParams(data : any) : Promise<any> {
        return await this.request('/api/v1/params', { method: 'PUT', body: data});
    }

    public async resetParams() : Promise<any> {
        return await this.request('/api/v1/params', { method: 'DELETE' });
    }
}
