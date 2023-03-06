import { AxiosRequestConfig as IAxiosRequestConfig } from "axios";
declare module "axios" {
    export interface AxiosRequestConfig extends IAxiosRequestConfig {
        // Add your own properties here
        cache?: boolean;
    }
}
