export default class JackFileReader {
    private relativePathToDir;
    private directoryName;
    constructor(relPath: string);
    read(): Promise<string[]>;
    getDirectoryName(): string;
    private identifyJackDirectory;
    private tokenizePath;
    private readDataInJackFiles;
    private readOneJackFile;
    private tokenizeJackCode;
    private getAbsolutePathsToJackFiles;
    private parseAbsolutePaths;
    private keepOnlyJack;
    private convertToAbsolutePaths;
}
//# sourceMappingURL=JackFileReader.d.ts.map