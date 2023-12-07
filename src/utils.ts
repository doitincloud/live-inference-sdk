import type * as types from './types';

import isInBrowser from './is-in-browser';

import { api_base_url } from './config';

let apiBaseUrl = api_base_url;

if (!isInBrowser()) {
    if (process.env.URL) {
        apiBaseUrl = process.env.URL;
    } else if (process.env.NODE_ENV !== 'production') { // for development
        apiBaseUrl = 'http://localhost:4321';
    }
} else {
    const { origin } = window.location;
    if (origin.indexOf('http://localhost') === 0) { // for development
        apiBaseUrl = 'http://localhost:4321';
    }
}

// a helper function to get the api base url
//
export function getApiBaseUrl() : string {
    return apiBaseUrl;
}

// a helper function to check if an object is a plain object
//
export function isPlainObject(val: any) : boolean {
    return !!val && typeof val === 'object' && val.constructor === Object;
}

let unauthorizedCallback = isInBrowser() ? (message: string) => alert(message) : null;

export function setUnauthorizedCallback(callback: (message: string) => void) {
    if (typeof callback !== 'function') {
        throw new Error('callback must be a function');
    }
    unauthorizedCallback = callback;
}

// get auth info from the server
//
export async function getKeyInfo(key?: string, useQuery?: boolean) : Promise<types.KeyInfo> {
    try {
        const { data, error } = await request('/api/v1/auth/me', { key, useQuery });
        if (!data) {
            throw new Error(error?.message || 'failed to get key info');
        }
        return data;
    } catch (err) {
        if (isInBrowser() && unauthorizedCallback) {
            unauthorizedCallback(err.message);
        } else {
            throw err;
        }
    }
}

// add auth info to a url or headers
//
export function withAuth(url: string, key: string, headers?: Headers) :  string {
    if (!key) {
        throw new Error('key is required');
    }
    if (url.startsWith(apiBaseUrl)) {
        if (!headers) {
            if (url.indexOf('?') === -1) {
                url += `?token=${key}`;
            } else {
                url += `&token=${key}`;
            }
        } else {
            headers.append('Authorization', `Bearer ${key}`);
        }
    }
    return url;
}

// a wrapper around request that returns json object
//
export async function request(url: string, options : types.RequestOptions = {}) : Promise<any> {
    const response = await getResponse(url, options);
    const json = await response.json();
    if (!response.ok && !json.error) {
        json.error = { message: response.statusText };
    }
    return json;
}

// a wrapper around fetch that handles some common tasks
// 
export async function getResponse(url: string, { 
    key,
    method,
    body,
    headers,
    useQuery,
    apiCall,
} : types.RequestOptions = {}) : Promise<any> {
    const inBrowser = isInBrowser();
    if (useQuery === undefined) {
        useQuery = inBrowser;
    }
    const hasHeaders = !!headers;
    if (!hasHeaders) {
        headers = new Headers();
    }
    if (apiCall === undefined) {
        if (url.startsWith('/api/v1/')) {
            apiCall = true;
        } else {
            apiCall = url.startsWith(apiBaseUrl);
        }
    }
    if (apiCall && !url.startsWith('http://') && !url.startsWith('https://')) {
        url = `${apiBaseUrl}${url}`;
    }     
    if (key) {
        if (useQuery === true) {
            url = withAuth(url, key);
        } else {
            withAuth(url, key, headers);
        }
    }
    if (body) {
        if (isPlainObject(body)) {
            body = JSON.stringify(body);
        }
        if (!method) {
            method = 'POST';
        }
        if (!hasHeaders) {
            headers.append('Content-Type', 'application/json');
        }
    } else if (!method) {
        method = 'GET';
    }
    const fetchOptions: RequestInit = { method, headers, body, cache: 'no-store' };
    if (inBrowser && apiCall) { // !key means we are counting on the browser to send the cookie
        if (!key || headers.has('Authorization')) {
            fetchOptions.mode = 'cors';
            fetchOptions.credentials = 'include';
        }
    }
    return await fetch(url, fetchOptions);
}