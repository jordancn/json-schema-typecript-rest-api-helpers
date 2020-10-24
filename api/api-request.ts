import { ApiEndpointSpecification } from './endpoints/specification';
import { HttpMethod, HttpRequest, HttpResponse } from './http-request';
import { GenericNotOkResponse } from './types';
import { getSchema, isValid, makeAlwaysValidValidator, makeValidator } from './validation/json-schema-validator';

export type ApiResponse<TOk, TNotOk> =
  | {
      ok: true;
      httpStatusCode: number;
      response: TOk;
    }
  | {
      ok: false;
      httpStatusCode: number;
      response: TNotOk;
    };

export const makeApiRequestFn = <TRequestParams, TRequestBody, TOkResponse, TApiEndpointSpecification extends ApiEndpointSpecification = ApiEndpointSpecification>(apiEndpointSpecification: TApiEndpointSpecification) => {
  const okResponseValidator = makeValidator<TOkResponse>(apiEndpointSpecification.okResponseSchemaName);
  const notOkResponseValidator = makeValidator<GenericNotOkResponse>(apiEndpointSpecification.notOkResponseSchemaName);
  const requestParamsValidator = apiEndpointSpecification.requestParamsSchemaName ? makeValidator<TRequestParams>(apiEndpointSpecification.requestParamsSchemaName) : makeAlwaysValidValidator<TRequestParams>();

  const requestParamsSchema = apiEndpointSpecification.requestParamsSchemaName ? getSchema(apiEndpointSpecification.requestParamsSchemaName) : { properties: {} };

  const requestParamKeys = Object.keys(requestParamsSchema.properties || {});

  const getRequestParams = (request: TRequestParams & TRequestBody): TRequestParams =>
    Object.keys(request).reduce((acc, key) => {
      if (requestParamKeys.includes(key)) {
        (acc as any)[key] = (request as any)[key];
      }
      return acc;
    }, {} as TRequestParams);

  const getRequestBody = (request: TRequestParams & TRequestBody): TRequestBody | undefined => {
    const requestBody = Object.keys(request).reduce((acc, key) => {
      if (!requestParamKeys.includes(key)) {
        (acc as any)[key] = (request as any)[key];
      }
      return acc;
    }, {} as TRequestBody);

    if (Object.keys(requestBody).length === 0) {
      return undefined;
    }

    return requestBody;
  };

  const getUrl = (requestParams: TRequestParams): string => {
    const allParamKeys = Object.keys(requestParams);
    const pathParamKeys = allParamKeys.filter((key) => apiEndpointSpecification.url.includes(`:${key}`));
    const queryParamKeys = allParamKeys.filter((key) => !apiEndpointSpecification.url.includes(`:${key}`));

    const path = pathParamKeys.reduce((acc, key) => {
      const re = new RegExp(`(:${key})(\\/|$)`);

      return acc.replace(re, `${encodeURIComponent((requestParams as any)[key])}$2`);
    }, apiEndpointSpecification.url);

    const queryParamString =
      queryParamKeys.length > 0
        ? `?${queryParamKeys
            .map((key) => ((requestParams as any)[key] !== undefined ? `${key}=${encodeURIComponent((requestParams as any)[key])}` : ''))
            .filter((param) => param.length > 0)
            .join('&')}`
        : '';

    return `${path}${queryParamString}`;
  };

  return async (request: TRequestParams & TRequestBody): Promise<ApiResponse<TOkResponse, GenericNotOkResponse>> => {
    const requestParams = getRequestParams(request);

    const requestParamsValidationResult = isValid<TRequestParams>(requestParamsValidator, requestParams);
    if (!requestParamsValidationResult.valid) {
      throw new Error(
        `[Client] Invalid request params received from caller (${JSON.stringify(requestParams)}) for ${apiEndpointSpecification.url} using schema ${
          apiEndpointSpecification.requestParamsSchemaName
        }: ${requestParamsValidationResult.reasons.join(', ')}`,
      );
    }

    const requestBody = getRequestBody(request);
    const url = getUrl(requestParams);

    const getHttpRequest = (): Promise<HttpResponse> => {
      switch (apiEndpointSpecification.method) {
        case HttpMethod.POST:
          return HttpRequest.post({ resource: url, body: requestBody });
        case HttpMethod.PUT:
          return HttpRequest.put({ resource: url, body: requestBody });
        case HttpMethod.DELETE:
          return HttpRequest.delete({ resource: url });
        case HttpMethod.GET:
        default:
          return HttpRequest.get({ resource: url });
      }
    };

    const httpRequest = getHttpRequest();
    const httpResponse = await httpRequest;

    if (httpResponse.status >= 200 && httpResponse.status <= 299) {
      const validationResult = isValid<TOkResponse>(okResponseValidator, httpResponse.response);

      if (!validationResult.valid) {
        console.error(
          `[Client] Invalid OK JSON response received from server (${httpResponse.status} ${JSON.stringify(httpResponse.response)}) for ${apiEndpointSpecification.url} using schema ${
            apiEndpointSpecification.okResponseSchemaName
          }: ${validationResult.reasons.join(', ')}`,
        );

        return {
          ok: false,
          httpStatusCode: httpResponse.status,
          response: {
            errorCode: -42,
            errorDescription: validationResult.reasons.join(', '),
          },
        };
      }

      return {
        ok: true,
        httpStatusCode: httpResponse.status,
        response: validationResult.value,
      };
    }

    const validationResult = isValid<GenericNotOkResponse>(notOkResponseValidator, httpResponse.response);

    if (!validationResult.valid) {
      console.error(
        `[Client] Invalid Not OK JSON response received from server (${httpResponse.status} ${JSON.stringify(httpResponse.response)}) for ${apiEndpointSpecification.url} using schema ${
          apiEndpointSpecification.notOkResponseSchemaName
        }: ${validationResult.reasons.join(', ')}`,
      );

      return {
        ok: false,
        httpStatusCode: httpResponse.status,
        response: {
          errorCode: -42,
          errorDescription: validationResult.reasons.join(', '),
        },
      };
    }

    return {
      ok: false,
      httpStatusCode: httpResponse.status,
      response: validationResult.value,
    };
  };
};
