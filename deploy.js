const fs = require("fs");
const path = require("path");

const logDir = path.join(__dirname, "logs");

fs.mkdirSync(logDir, { recursive: true });

const logfile = path.join(
    logDir,
    `${new Date().toISOString().slice(0,10)}.log`
);

const stream = fs.createWriteStream(logfile, { flags: "a" });

const originalLog = console.log;
const originalError = console.error;

console.log = (...args) => {
    const line = args.join(" ");
    originalLog(...args);
    stream.write(line + "\n");
};

console.error = (...args) => {
    const line = args.join(" ");
    originalError(...args);
    stream.write("[ERROR] " + line + "\n");
};

const { execSync } = require("child_process");

function run(command, inherit = true) {
    return execSync(command, {
        encoding: "utf8",
        stdio: inherit ? "inherit" : "pipe"
    });
}

function getTimestamp() {

    return new Date().toLocaleString("sv-SE", {
        dateStyle: "short",
        timeStyle: "short"
    });

}

try {

    console.log("🔍 Kontrollerar arbetskatalog...");

    const status = run("git status --porcelain src", false);

    if (status.trim() !== "") {

        console.error("\n❌ Det finns okommitterade ändringar i src/\n");
        console.error(status);
        console.error("Committa eller stasha ändringarna innan du kör deploy.\n");

        process.exit(1);

    }

    console.log("\n🍷 Bygger rapport...");
    run("node src/systembolaget.js");

    console.log("\n📦 Lägger till docs...");
    run("git add docs");

    const docsStatus = run("git status --porcelain docs", false);

    if (docsStatus.trim() === "") {

        console.log("\nℹ️ Inga ändringar i docs. Ingenting att publicera.");

        process.exit(0);

    }

    const message = `Uppdaterat sortiment ${getTimestamp()}`;

    console.log("\n💾 Skapar commit...");
    run(`git commit -m "${message}"`);

    console.log("\n🚀 Pushar till GitHub...");
    run("git push");

    console.log("\n✅ Publiceringen är klar!");

}
catch (err) {

    console.error("\n❌ Deploy misslyckades.\n");

    if (err.message) {
        console.error(err.message);
    }

    process.exit(1);

}