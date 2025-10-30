import { expressjwt as jwt } from "express-jwt";
import jwksRsa from "jwks-rsa";

export const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: "https://dev-jhchkgikcsdj6y7w.eu.auth0.com/.well-known/jwks.json",
  }),
  audience: "https://gescomm/api",
  issuer: "https://dev-jhchkgikcsdj6y7w.eu.auth0.com/",
  algorithms: ["RS256"],
});
