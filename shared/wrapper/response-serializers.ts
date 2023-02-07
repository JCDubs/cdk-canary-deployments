type ResponseSerializersFn = ({ body }) => string;

export class ResponseSerializer {
  public readonly regex: RegExp;
  public readonly serializer: ResponseSerializersFn;
  constructor(regex: RegExp, serializer: ResponseSerializersFn) {
    this.regex = regex;
    this.serializer = serializer;
  }
}

interface ResponseSerializers {
  serializers: Array<ResponseSerializer>;
  defaultContentType: string;
  default: string;
}

export const responseSerializers: ResponseSerializers = {
  serializers: [
    new ResponseSerializer(
      /^application\/xml$/,
      ({ body }) => `<message>${body}</message>`,
    ),
    new ResponseSerializer(/^application\/json$/, ({ body }) =>
      JSON.stringify(body),
    ),
    new ResponseSerializer(/^text\/plain$/, ({ body }) => JSON.stringify(body)),
  ],
  defaultContentType: 'application/json',
  default: 'application/json',
};
