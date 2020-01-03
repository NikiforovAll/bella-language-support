import { BaseDeclaration } from "./base-declaration";
export interface ComponentServiceDeclaration extends BaseDeclaration{
    serviceType: string;
    serviceName: string;
    serviceTransportName: string;
}
