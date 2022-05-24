

export class Error {
    static raiseError(input: string, lineno: number, colno: number, errorname: string, errortext: string, length: number) {

        let codesnippet: string = input.split("\n")[lineno];
        let maxlinelen: number = Math.max(
            (lineno + 1).toString().length,
            lineno + 1 < input.split("\n").length ? (lineno + 2).toString().length : 0
        );

        let codesnippet2: string = input.split("\n")[lineno - 1]
        let codesnippet3: string = input.split("\n")[lineno + 1]
        codesnippet2 = codesnippet2 !== undefined ?     `\n${lineno} | ${codesnippet2}` : "";
        codesnippet3 = codesnippet3 !== undefined ? `\n${lineno + 2} | ${codesnippet3}` : ""

        console.log("\x1b[31m" + `${errorname}!
${errortext}
${codesnippet2}
${lineno + 1} | ${codesnippet}
${" ".repeat(colno + maxlinelen + 3)}${"^".repeat(length)}${codesnippet3}
` + "\x1b[0m")
        process.exit(0);
    }
}