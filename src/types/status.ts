interface Status {
  name: string;
  message: string;
  stack?: string;
  result?: any;
}

interface StatusConstructor {
  new (message?: string): Status;
  (message?: string): Status;
  readonly prototype: Status;
}

// declare const Status: StatusConstructor;

const Status: StatusConstructor = function (message?: string): Status {
  return { name: 'Status', message: message || '' };
} as any;

export { Status }; // Exporting the Status interface


