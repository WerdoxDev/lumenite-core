export interface Light {
    index: number,
    status: StatusType
}

export enum StatusType {
    OFF = "OFF", PROCESSING = "PROCESSING", ON = "ON"
}