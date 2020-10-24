import * as ApiRequest from '../api-request';
import { HttpMethod } from '../http-request';
import * as Types from '../types';
import { ApiEndpointSpecification } from './specification';

export const SendMessageEndpointSpecification: ApiEndpointSpecification = {
  url: '/messages/:contactId',
  method: HttpMethod.POST,
  requestParamsSchemaName: 'SendMessageRequestParams',
  requestBodySchemaName: 'SendMessageRequestBody',
  okResponseSchemaName: 'SendMessageOkResponse',
  notOkResponseSchemaName: 'NotOkResponse',
};

export const sendMessage = ApiRequest.makeApiRequestFn<Types.SendMessageRequestParams, Types.SendMessageRequestBody, Types.SendMessageOkResponse>(SendMessageEndpointSpecification);
