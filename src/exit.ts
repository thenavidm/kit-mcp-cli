/**
 * 2.x's exit words, kept for errors that carry no status or code of their own,
 * such as a profile that does not exist or a private file that cannot be read.
 * This repo's words go first, then the ones every server shares.
 */

import { ApiError, AuthError, NotConfiguredError, NotFoundError, RateLimitError, UsageError, type SlipwayError } from "@thenavidm/slipway";

/** What a Slipway error takes besides its message: a status, details, a hint. */
type ErrorOptions = NonNullable<ConstructorParameters<typeof ApiError>[1]>;

const EXIT = { ok: 0, usage: 2, notFound: 3, auth: 4, api: 5, rateLimited: 7, config: 10 } as const;

/** This server's own error words, checked before the generic ones. */
const EXIT_WORDS: [RegExp, number][] = [[/invalid arguments|unsupported kit|pagination|payload_file|secret_name/i,2],[/oauth is required|oauth token|oauth refresh/i,4],[/unknown account|private kit tokens file|invalid settings|KIT_ACCOUNTS|Kit account (?:requires|names)/i,10]];

export function exitCodeFor(message: string): number {
  const text = message.toLowerCase();
  for (const [pattern, code] of EXIT_WORDS) if (pattern.test(text)) return code;
  if (/input validation|invalid arguments|invalid params|-32602/.test(text)) return EXIT.usage;
  if (/will not run without|without confirm|confirm: true|--confirm|read[-_ ]only|is unavailable|is disabled/.test(text)) return EXIT.usage;
  if (/rate ?limit|too many requests|\b429\b|quota/.test(text)) return EXIT.rateLimited;
  // Config before auth: "no token configured" mentions a token, and matching
  // auth first sends someone who configured nothing looking for a bad one.
  if (/not configured|nothing is configured|not signed in|no [a-z ]*(account|credential|token|key)s? (is |are )?(set|configured)|missing .*env|run `?[a-z-]+ login/.test(text))
    return EXIT.config;
  if (/\b401\b|\b403\b|unauthori[sz]ed|forbidden|invalid[_ ]grant|token (has )?expired|expired token|authenticat|credential|permission denied|insufficient permission/.test(text))
    return EXIT.auth;
  if (/\b404\b|not found|no such|does not exist/.test(text)) return EXIT.notFound;
  return EXIT.api;
}

/** The Slipway error for an exit code, so the code survives the move. */
export function errorForExit(code: number, message: string, options: ErrorOptions = {}): SlipwayError | undefined {
  if (code === EXIT.usage) return new UsageError(message.replace(/^Invalid arguments: /, ""), options);
  if (code === EXIT.config) return new NotConfiguredError(message, options);
  if (code === EXIT.auth) return new AuthError(message, options);
  if (code === EXIT.notFound) return new NotFoundError(message, options);
  if (code === EXIT.rateLimited) return new RateLimitError(message, options);
  if (code === EXIT.api) return new ApiError(message, options);
  return undefined;
}
