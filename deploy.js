const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// --------------------------------------------------
// Loggning
// --------------------------------------------------

const logDir = path.join(__dirname, "logs");
fs.mkdirSync(logDir, { recursive: true });

const startTime = new Date();

function pad(n) {
    return String(n).padStart(2, "0");
}

function formatFilename(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
}

function timestamp() {
    return new Date().toLocaleString("sv-SE");
}

const logfile = path.join(
    logDir,
    `${formatFilename(startTime)}.log`
);

const stream = fs.createWriteStream(logfile);

const originalLog = console.log;
const originalError = console.error;

function write(prefix, args) {

    const text = args.map(a => {

        if (typeof a === "string")
            return a;

        return JSON.stringify(a, null, 2);

    }).join(" ");

    const line = `[${timestamp()}] ${prefix}${text}`;

    stream.write(line + "\n");

    if (prefix.startsWith("[ERROR]"))
        originalError(text);
    else
        originalLog(text);

}

console.log = (...args) => write("", args);
console.error = (...args) => write("[ERROR] ", args);

function separator() {
    console.log("============================================================");
}

separator();
console.log("Systembolaget Växjö");
console.log(`Start: ${timestamp()}`);
separator();

// --------------------------------------------------
// Kör externa kommandon
// --------------------------------------------------

function run(command) {

    console.log("");
    console.log(`> ${command}`);

    try {

        const output = execSync(command, {
            encoding: "utf8",
            stdio: "pipe"
        });

        if (output.trim()) {
            console.log(output.trim());
        }

        return output;

    }
    catch (err) {

        if (err.stdout)
            console.log(err.stdout.toString().trim());

        if (err.stderr)
            console.error(err.stderr.toString().trim());

        throw err;

    }

}

// --------------------------------------------------

function getCommitTimestamp() {

    return new Date().toLocaleString("sv-SE", {
        dateStyle: "short",
        timeStyle: "short"
    });

}

// --------------------------------------------------

try {

    console.log("🔍 Kontrollerar arbetskatalog...");

    const status = run("git status --porcelain src");

    if (status.trim() !== "") {

        console.log("");
        console.log("⚠️  VARNING");
        console.log("Det finns okommitterade ändringar i src/");
        console.log(status);
        console.log("Deploy fortsätter ändå...");
        console.log("");

    }

    console.log("");
    console.log("🍷 Bygger rapport...");
    run("node src/systembolaget.js");

    console.log("");
    console.log("📦 Lägger till docs...");
    run("git add docs");

    const docsStatus = run("git status --porcelain docs");

    if (docsStatus.trim() === "") {

        console.log("");
        console.log("ℹ️ Inga ändringar i docs.");
        console.log("Ingen publicering behövs.");

        process.exit(0);

    }

    const message = `Uppdaterat sortiment ${getCommitTimestamp()}`;

    console.log("");
    console.log("💾 Skapar commit...");
    run(`git commit -m "${message}"`);

    console.log("");
    console.log("🚀 Pushar till GitHub...");
    run("git push");

    const elapsed =
        ((Date.now() - startTime.getTime()) / 1000).toFixed(1);

    separator();
    console.log("✅ Publiceringen är klar!");
    console.log(`Körningstid: ${elapsed} sekunder`);
    console.log(`Loggfil: ${path.basename(logfile)}`);
    console.log(`Slut: ${timestamp()}`);
    separator();

}
catch (err) {

    const elapsed =
        ((Date.now() - startTime.getTime()) / 1000).toFixed(1);

    separator();
    console.error("Deploy misslyckades.");

    if (err.message)
        console.error(err.message);

    console.error(`Körningstid: ${elapsed} sekunder`);
    console.error(`Loggfil: ${path.basename(logfile)}`);
    console.error(`Slut: ${timestamp()}`);
    separator();

    process.exit(1);

}
finally {

    stream.end();

}
