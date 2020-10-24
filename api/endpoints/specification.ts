import { HttpMethod } from '../http-request';
import { Schema } from '../schema';

export type ApiEndpointSpecification = {
  url: string;
  method: HttpMethod;
  requestParamsSchemaName?: keyof typeof Schema;
  requestBodySchemaName: keyof typeof Schema;
  okResponseSchemaName: keyof typeof Schema;
  notOkResponseSchemaName: keyof typeof Schema;
};
