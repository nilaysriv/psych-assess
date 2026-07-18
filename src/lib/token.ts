import { randomBytes } from "node:crypto";

// 32 random bytes -> 43-char base64url string. This token is the *only*
// access control on a client's assessment link (PRD 7.1), so it must be
// unguessable: never derive it from an id, timestamp, or counter.
export function randomToken(): string {
  return randomBytes(32).toString("base64url");
}
