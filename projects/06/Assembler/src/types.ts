export interface Command {
    commandType: CommandType;
    tokens: CommandTokens;
}

export interface CommandTokens {
    symbol: string;
    value: number;
    dest: string;
    comp: string;
    jump: string;
}

export enum CommandType {
    ACommand = "ACommand",
    CCommand = "CCommand",
    LCommand = "LCommand",
}
