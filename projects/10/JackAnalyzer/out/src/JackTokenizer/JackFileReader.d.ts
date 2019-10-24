export default class JackFileReader {
    private relativePathToDir;
    private directoryName;
    constructor(relPath: string);
    readTokensFromJackFile(pathToJackFile: string): Promise<string[]>;
    getDirectoryName(): string;
    getAbsolutePathsToJackFiles(): Promise<string[]>;
    private identifyJackDirectory;
    private tokenizePath;
    private readDataInJackFiles;
    private readOneJackFile;
    private tokenizeJackCode;
    private parseAbsolutePaths;
    private keepOnlyJack;
    private convertToAbsolutePaths;
}
//# sourceMappingURL=JackFileReader.d.ts.map