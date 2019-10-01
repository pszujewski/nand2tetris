import JackAnalyzer from "./JackAnalyzer";

class Main {
    static run(): void {
        const path: string = process.argv[2];
        const analyzer: JackAnalyzer = new JackAnalyzer(path);
        analyzer.analyze();
    }
}

Main.run();
