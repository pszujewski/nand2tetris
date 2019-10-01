export default class Source {
    private src: string;
    private idx: number;

    constructor(src: string) {
        this.src = src;
        this.idx = 0;
    }

    public getNextChar() {
        const current: number = this.idx;
        this.idx = this.idx + 1;

        if (current < this.src.length) {
            return this.src[current];
        }
        return "";
    }
}
