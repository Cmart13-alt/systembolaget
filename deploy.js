const { execSync } = require("child_process");

function run(command) {
    console.log(`\n> ${command}`);

    execSync(command, {
        stdio: "inherit"
    });
}

function getTimestamp() {

    const now = new Date();

    return now.toLocaleString("sv-SE", {
        dateStyle: "short",
        timeStyle: "short"
    });
}

try {

    console.log("🍷 Bygger rapport...");

    run("node src/systembolaget.js");

    console.log("\n📦 Lägger till ändringar...");

    run("git add .");

    const message = `Uppdaterat sortiment ${getTimestamp()}`;

    console.log("\n💾 Skapar commit...");

    try {
        run(`git commit -m "${message}"`);
    }
    catch {

        console.log("\nℹ️ Inga ändringar att committa.");
    }

    console.log("\n🚀 Pushar till GitHub...");

    run("git push");

    console.log("\n✅ Klart!");

}
catch (err) {

    console.error("\n❌ Deploy misslyckades.");

    process.exit(1);

}