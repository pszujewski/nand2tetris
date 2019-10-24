import JackAnalyzer from "./JackAnalyzer";

class Main {
    static run(): void {
        const path: string = process.argv[2];
        const JA: JackAnalyzer = new JackAnalyzer(path);
        JA.analyze();
    }
}

Main.run();
