import * as ApiRequest from '../api-request';
import { HttpMethod } from '../http-request';
import * as Types from '../types';
import { ApiEndpointSpecification } from './specification';

export const GetMessagesEndpointSpecification: ApiEndpointSpecification = {
  url: '/messages/:contactId',
  method: HttpMethod.GET,
  requestParamsSchemaName: 'GetMessagesRequestParams',
  requestBodySchemaName: 'GetMessagesRequestBody',
  okResponseSchemaName: 'GetMessagesOkResponse',
  notOkResponseSchemaName: 'NotOkResponse',
};

export const getMessages = ApiRequest.makeApiRequestFn<Types.GetMessagesRequestParams, Types.GetMessagesRequestBody, Types.GetMessagesOkResponse>(GetMessagesEndpointSpecification);
