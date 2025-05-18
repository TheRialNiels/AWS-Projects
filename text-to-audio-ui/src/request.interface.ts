export interface SuccessResponse {
    data:       Data;
    status:     number;
    statusText: string;
    headers:    SuccessResponseHeaders;
    config:     Config;
    request:    Request;
}

interface Config {
    transitional:      Transitional;
    adapter:           string[];
    transformRequest:  null[];
    transformResponse: null[];
    timeout:           number;
    xsrfCookieName:    string;
    xsrfHeaderName:    string;
    maxContentLength:  number;
    maxBodyLength:     number;
    env:               Request;
    headers:           ConfigHeaders;
    baseURL:           string;
    method:            string;
    url:               string;
    data:              string;
    allowAbsoluteUrls: boolean;
}

interface Request {
}

interface ConfigHeaders {
    Accept:         string;
    "Content-Type": string;
}

interface Transitional {
    silentJSONParsing:   boolean;
    forcedJSONParsing:   boolean;
    clarifyTimeoutError: boolean;
}

interface Data {
    message:     string;
    downloadUrl: string;
}

interface SuccessResponseHeaders {
    "content-length": string;
    "content-type":   string;
}
