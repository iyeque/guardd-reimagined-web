import { app, routesReady } from '../server/index';

export default async function handler(req: any, res: any) {
  // Wait for routes to be registered before handling the first request
  await routesReady;
  
  // Forward the request to the express app
  return app(req, res);
}
