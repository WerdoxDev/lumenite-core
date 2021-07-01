import { Socket } from "socket.io-client";

export interface Light {
    index: number,
    status: StatusType
}

export enum StatusType {
    Off = "OFF", Processing = "PROCESSING", On = "ON"
}

export interface TempSensor {
    temperature: string,
    humidity: string
}

export interface ModalState {
    isOpen: boolean,
    title: string,
    text: string,
    type: ModalType,
    code: string | null
}

export interface State {
    socket: Socket,
    isUserLoggedIn: boolean,
    isCloudConnected: boolean,
    isModuleConnected: boolean
}

// Mutation types
export enum MutationType {
    SetUserLoggedIn = "SET_USER_LOGGED_IN",
    SetModuleConnected = "SET_MODULE_CONNECTED",
    SetCloudConnected = "SET_CLOUD_CONNECTED",
}

// Action types
export enum ActionsType {
    SetUserLoggedIn = "setUserLoggedIn",
    SetModuleConnected = "setModuleConnected",
    SetCloudConnected = "setCloudConnected",
}

// Getters types
export enum GettersType {
    IsUserLoggedIn = "isUserLoggedIn",
    isModuleConnected = "isModuleConnected",
    IsCloudConnected = "isCloudConnected"
}

export enum ErrorType {
    LightFailure = "LIGHT_FAILURE",
    RequestTimeout = "REQUEST_TIMEOUT"
}

export enum ModalType {
    Error = "ERROR:",
    Info = "INFO",
    Success = "SUCCESS"
}

const name3 = 'mamad2';
const name = 'mamad2';
        const name2 = 'mamad2';