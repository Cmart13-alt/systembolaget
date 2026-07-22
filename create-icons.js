const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const pngToIco = require("png-to-ico");
const archiver = require("archiver");

const INPUT = "logo.png";
const OUT = "icons";

if (!fs.existsSync(INPUT)) {
    console.error("❌ Kan inte hitta logo.png");
    process.exit(1);
}

if (!fs.existsSync(OUT)) {
    fs.mkdirSync(OUT);
}

async function createIcon(size, scale, filename) {

    const logo = sharp(INPUT);

    const metadata = await logo.metadata();

    const target = Math.round(size * scale);

    const resized = await logo
        .resize(target, target, {
            fit: "inside",
            withoutEnlargement: true
        })
        .png()
        .toBuffer();

    const resizedMeta = await sharp(resized).metadata();

    const left = Math.round((size - resizedMeta.width) / 2);
    const top = Math.round((size - resizedMeta.height) / 2);

    await sharp({
        create: {
            width: size,
            height: size,
            channels: 4,
            background: {
                r: 255,
                g: 255,
                b: 255,
                alpha: 1
            }
        }
    })
        .composite([
            {
                input: resized,
                left,
                top
            }
        ])
        .png()
        .toFile(path.join(OUT, filename));

    console.log("✔", filename);
}

async function createSvg() {

    const png = fs.readFileSync(path.join(OUT, "favicon.png"));

    const base64 = png.toString("base64");

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
<image href="data:image/png;base64,${base64}" width="64" height="64"/>
</svg>`;

    fs.writeFileSync(path.join(OUT, "favicon.svg"), svg);
}

async function createIco() {

    const ico = await pngToIco(path.join(OUT, "favicon.png"));

    fs.writeFileSync(
        path.join(OUT, "favicon.ico"),
        ico
    );
}

async function createZip() {

    return new Promise((resolve, reject) => {

        const output = fs.createWriteStream("vinlogg-icons.zip");
        const archive = archiver("zip", {
            zlib: { level: 9 }
        });

        output.on("close", resolve);
        archive.on("error", reject);

        archive.pipe(output);

        [
            "favicon.svg",
            "favicon.ico",
            "icon-192.png",
            "icon-512.png",
            "maskable-512.png",
            "apple-touch-icon.png"
        ].forEach(file => {

            archive.file(
                path.join(OUT, file),
                { name: file }
            );

        });

        archive.finalize();

    });

}

(async () => {

    console.log("Skapar ikoner...");

    await createIcon(512, 0.82, "icon-512.png");
    await createIcon(192, 0.82, "icon-192.png");
    await createIcon(180, 0.82, "apple-touch-icon.png");

    // Maskable får större vit kant
    await createIcon(512, 0.66, "maskable-512.png");

    await createIcon(64, 0.82, "favicon.png");

    await createSvg();

    await createIco();

    fs.unlinkSync(path.join(OUT, "favicon.png"));

    await createZip();

    console.log();
    console.log("✅ Klart!");
    console.log("📦 vinlogg-icons.zip skapad.");

})();