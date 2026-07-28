import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { HttpHandler, HttpResponseResolver } from "msw";

type HttpMethod = "get" | "post" | "put" | "patch" | "delete" | "head";

interface HandlerConfig {
  path: string;
  method: HttpMethod;
  res: (info: Parameters<HttpResponseResolver>[0]) => Record<string, unknown>;
}

export function createServer(handlerConfig: HandlerConfig[]) {
  const handlers: HttpHandler[] = handlerConfig.map((config) => {
    return http[config.method](config.path, (info) => {
      return HttpResponse.json(config.res(info));
    });
  });

  const server = setupServer(...handlers);

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
}
