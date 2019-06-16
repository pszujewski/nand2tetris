#!/usr/bin/env node

import * as path from "path";
import Assembler from "./Assembler";
import { Command } from "./types";
import Log from "./Util";

const assembler: Assembler = new Assembler();

class Main {
    public static execute = () => {
        const relPath: string = process.argv[2];

        if (typeof relPath !== "string") {
            throw new Error(
                "Must provide valid relative path to input ASM file"
            );
        }

        Main.assemble(path.resolve(__dirname, relPath));
    };

    private static assemble = async (pathToFile: string) => {
        let tokens: string[];
        let commands: Command[];
        let machineCodes: string[];

        try {
            tokens = await assembler.getASMTokens(pathToFile);
            commands = assembler.parseASMInstructions(tokens);
            machineCodes = assembler.translateToMachineCode(commands);
        } catch (err) {
            Log.error(err.message);
        }
    };
}

Main.execute();
