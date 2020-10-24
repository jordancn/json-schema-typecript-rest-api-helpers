import { OutgoingHttpHeaders } from 'http';
// For Browser-based environments, remove the following import
import fetch from 'node-fetch';

const API_URL = 'http://localhost:8080/api';

export enum HttpMethod {
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  GET = 'GET',
  DELETE = 'DELETE',
}

export type BaseHttpResponse<T> = {
  status: number;
  response: T;
};

type HttpRequestParams<TBody = unknown> =
  | {
      method: 'GET';
    }
  | {
      method: 'DELETE';
    }
  | {
      method: 'POST';
      body: TBody;
    }
  | {
      method: 'PUT';
      body: TBody;
    };

type HttpRequestBase = {
  resource: string;
};

type HttpRequestOptions = {
  responseType?: 'text' | 'json';
  headers?: OutgoingHttpHeaders;
};

export type HttpResponse<TResponse = unknown> = {
  status: number;
  response: TResponse;
};

const request = async <TBody = unknown, TResponse = unknown>(args: HttpRequestParams & HttpRequestBase & HttpRequestOptions): Promise<{ status: number; response: TResponse }> => {
  const resource = `${API_URL}${args.resource}`;

  const req = fetch(resource, {
    method: args.method,
    headers: {
      ...('body' in args ? { 'Content-Type': 'application/json' } : {}),
      ...args.headers,
    },
    ...('body' in args
      ? {
          body: JSON.stringify(args.body),
        }
      : {}),
  });

  try {
    const response = await req;

    return {
      status: response.status,
      response: args.responseType === 'text' ? await response.text() : await response.json(),
    };
  } catch (error) {
    console.error('HttpRequest: request', { resource, req, error });

    return {
      status: 0,
      response: (error as Error).message as any,
    };
  }
};

export const HttpRequest = {
  request,

  post: <TBody = {}>(
    args: {
      resource: string;
      body: TBody;
    } & HttpRequestOptions,
  ): Promise<HttpResponse> => request<TBody>({ method: 'POST', ...args }),

  put: <TBody = {}>(args: { resource: string; body: TBody } & HttpRequestOptions): Promise<HttpResponse> => request<TBody>({ method: 'PUT', ...args }),

  get: <TResponse>(args: { resource: string } & HttpRequestOptions): Promise<HttpResponse<TResponse>> => request<never, TResponse>({ method: 'GET', ...args }),

  delete: (args: { resource: string } & HttpRequestOptions): Promise<HttpResponse> => request({ method: 'DELETE', ...args }),
};
