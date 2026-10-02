export class KitError extends Error {
 constructor(message: string, readonly status = 0, readonly code = "API_ERROR") { super(message); this.name = "KitError"; }
 toJSON(): Record<string, unknown> { return { error: this.message, status: this.status, code: this.code }; }
}
export class UsageError extends KitError {
 constructor(message: string) { super(`Invalid arguments: ${message}`, 0, "USAGE"); }
}

export class WriteBlockedError extends KitError {
 constructor(message:string) {super(message,0,"USAGE");}
}
