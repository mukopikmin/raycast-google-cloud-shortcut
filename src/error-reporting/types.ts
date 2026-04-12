export type ServiceContext = {
  service: string;
  version: string;
};

export type TimedCount = {
  count: string;
  startTime: string;
  endTime: string;
};

export type SourceLocation = {
  filePath: string;
  lineNumber: number;
  functionName: string;
};

export type HttpRequestContext = {
  method: string;
  url: string;
  userAgent: string;
  referrer: string;
  responseStatusCode: number;
  remoteIp: string;
};

export type ErrorContext = {
  httpRequest?: HttpRequestContext;
  user?: string;
  reportLocation?: SourceLocation;
};

export type TrackingIssue = {
  url: string;
};

export type ResolutionStatus =
  | "RESOLUTION_STATUS_UNSPECIFIED"
  | "OPEN"
  | "ACKNOWLEDGED"
  | "RESOLVED"
  | "MUTED";

export type ErrorGroupStats = {
  group: {
    groupId: string;
    name: string;
    trackingIssues?: TrackingIssue[];
    resolutionStatus?: ResolutionStatus;
  };
  count: string;
  affectedUsersCount: string;
  representative: {
    message: string;
    eventTime?: string;
    serviceContext?: ServiceContext;
    context?: ErrorContext;
  };
  firstSeenTime: string;
  lastSeenTime: string;
  numAffectedServices: number;
  affectedServices: ServiceContext[];
  timedCounts: TimedCount[];
  url: string;
};
