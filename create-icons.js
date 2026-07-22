const fs = require("fs");
const path = require("path");
const sharp = require("sharp");


let pngToIco = null;

try {
    pngToIco = require("png-to-ico").default || require("png-to-ico");
} catch (err) {
    console.warn("png-to-ico saknas, favicon.ico kommer inte skapas.");
}

const INPUT = "logo.png";
const OUTPUT = "icons";

const THEMES = [
    {
        name: "light",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
        foreground: { r: 11, g: 107, b: 58, alpha: 1 }
    },
    {
        name: "dark",
        background: { r: 11, g: 107, b: 58, alpha: 1 },
        foreground: { r: 255, g: 255, b: 255, alpha: 1 }
    }
];

function ensureDirectory(dir) {

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

}

function initialiseFolders() {

    if (!fs.existsSync(INPUT)) {
        console.error(`❌ Hittar inte ${INPUT}`);
        process.exit(1);
    }

    ensureDirectory(OUTPUT);

    for (const theme of THEMES) {
        ensureDirectory(path.join(OUTPUT, theme.name));
    }

    console.log("✔ Mappar skapade.");

}

initialiseFolders();
async function main() {

    try {

        initialiseFolders();

        console.log("");
        console.log("==============================");
        console.log(" Icon Generator");
        console.log("==============================");

        for (const theme of THEMES) {

            console.log("");
            console.log(`Tema: ${theme.name}`);

            await createAllIcons(theme);
            await createSvg(theme);
            await createIco(theme);
        

            console.log(`✔ ${theme.name} klart`);

        }

        console.log("");
        console.log("==============================");
        console.log(" Alla ikoner genererade!");
        console.log("==============================");
        console.log("");

    }
    catch (err) {

        console.error("");
        console.error("Ett fel inträffade:");
        console.error(err);

        process.exit(1);

    }

}

main();


async function prepareLogo(theme) {

    const { data, info } = await sharp(INPUT)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    // RGBA
    for (let i = 0; i < data.length; i += 4) {

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Ljushet
        const brightness = (r + g + b) / 3;

        // Helt vitt = transparent
        if (brightness > 245) {
            data[i + 3] = 0;
            continue;
        }

        // Behåll mjuka kanter genom att låta ljusare pixlar
        // få lägre alfa istället för att bara klippa bort dem.
        let alpha = 255;

        if (brightness > 180) {
            alpha = Math.round(
                255 * ((245 - brightness) / (245 - 180))
            );
        }

        data[i]     = theme.foreground.r;
        data[i + 1] = theme.foreground.g;
        data[i + 2] = theme.foreground.b;
        data[i + 3] = alpha;
    }

    return sharp(data, {
        raw: info
    }).png();

}

async function createIcon(theme, size, scale, filename) {

    // Skapa logotypen i rätt färg
    const logo = await prepareLogo(theme);

    // Hur stor logotypen ska vara i förhållande till ikonen
    const logoSize = Math.round(size * scale);

    const logoBuffer = await logo
        .resize(logoSize, logoSize, {
            fit: "inside",
            withoutEnlargement: true
        })
        .png()
        .toBuffer();

    const metadata = await sharp(logoBuffer).metadata();

    // Centrera logotypen
    const left = Math.round((size - metadata.width) / 2);
    const top = Math.round((size - metadata.height) / 2);

    await sharp({
        create: {
            width: size,
            height: size,
            channels: 4,
            background: theme.background
        }
    })
    .composite([
        {
            input: logoBuffer,
            left,
            top
        }
    ])
    .png()
    .toFile(filename);

    console.log(`✔ ${path.basename(filename)}`);

}

async function createAllIcons(theme) {

    const dir = path.join(OUTPUT, theme.name);

    console.log(`\nSkapar ${theme.name}-ikoner...`);

    await createIcon(theme, 512, 0.82, path.join(dir, "icon-512.png"));
    await createIcon(theme, 192, 0.82, path.join(dir, "icon-192.png"));
    await createIcon(theme, 180, 0.82, path.join(dir, "apple-touch-icon.png"));

    // Maskable ska ha lite större marginal
    await createIcon(theme, 512, 0.66, path.join(dir, "maskable-512.png"));

}

async function createSvg(theme) {

    const dir = path.join(OUTPUT, theme.name);

    const png = fs.readFileSync(
        path.join(dir, "icon-192.png")
    ).toString("base64");

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 192 192">
    <image
        href="data:image/png;base64,${png}"
        width="192"
        height="192"/>
</svg>`;

    fs.writeFileSync(
        path.join(dir, "favicon.svg"),
        svg
    );

    console.log("✔ favicon.svg");

}

async function createIco(theme) {

    if (!pngToIco)
        return;

    const dir = path.join(OUTPUT, theme.name);

    try {

        const ico = await pngToIco(
            path.join(dir, "icon-192.png")
        );

        fs.writeFileSync(
            path.join(dir, "favicon.ico"),
            ico
        );

        console.log("✔ favicon.ico");

    }
    catch (err) {

        console.warn(
            "favicon.ico kunde inte skapas."
        );

    }

}

