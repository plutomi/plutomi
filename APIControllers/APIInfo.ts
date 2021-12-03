import { Request, Response } from "express";

export const info = async (req: Request, res: Response) => {
  const endpoints = req.app.get("endpoints");
  const cleanedEndpoints = endpoints.map((endpoint) => {
    delete endpoint.middlewares;
    return endpoint;
  });
  return res.status(200).json({
    message: "OK",
    endpoints: cleanedEndpoints,
    request: {
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
      cookies: req.cookies,
      ip: req.ip,
      ips: req.ips,
      session: req.session,
      subdomains: req.subdomains,
    },
  });
};
