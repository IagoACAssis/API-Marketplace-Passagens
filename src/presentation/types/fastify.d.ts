import { FastifyInstance as OriginalFastifyInstance, FastifyRequest as OriginalFastifyRequest } from 'fastify';

declare module 'fastify' {
  export interface FastifyInstance extends OriginalFastifyInstance {
    authenticate: any;
    jwt: {
      sign: (payload: any, options?: any) => string;
      verify: (token: string, options?: any) => any;
      decode: (token: string, options?: any) => any;
    };
  }

  export interface FastifyRequest extends OriginalFastifyRequest {
    user: any;
  }
}

declare module '@fastify/jwt' {
  const fastifyJwt: any;
  export default fastifyJwt;
}

declare module 'fastify-jwt' {
  const fastifyJwt: any;
  export default fastifyJwt;
} 