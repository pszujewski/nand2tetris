import JackCompiler from "./JackCompiler";

class Main {
    static run(): void {
        const path: string = process.argv[2];
        const compiler: JackCompiler = new JackCompiler(path);
        JA.analyze();
    }
}

Main.run();
