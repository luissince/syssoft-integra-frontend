import { AxiosRequestConfig } from "axios";

export interface DownloadSlice {
    id: string;
    fileName?: string | null;
    request: AxiosRequestConfig;
}