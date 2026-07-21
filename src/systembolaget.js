const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const { getAllProducts, enrichProducts } = require("./api");
const {
    createVivinoLink,
    createSystembolagetLink,
    escapeHtml,
    formatPrice,
    formatGrapes
} = require("./utils");

const { generateReport } = require("./html");

const stores = require("./stores");

const maxProducts = process.argv[2]
    ? parseInt(process.argv[2], 10)
    : null;

console.log(`Max antal viner: ${maxProducts ?? "Alla"}`);

async function main() {


    console.log("Hämtar sortiment...");

    let products = await getAllProducts(stores, maxProducts);

    console.log(
        `${products.length} viner hittades`
    );


    /*
       Hämta lager från alla butiker
    */

 


    products = await enrichProducts(products, stores);


    for (const product of products) {

        product.systembolaget =
            createSystembolagetLink(product);

        product.vivino =
            createVivinoLink(product);

    }




        /*
        Skapa HTML
        */

        const html = generateReport(products, stores);

        const docsDir = path.join(
            __dirname,
            "..",
            "docs"
        );

        // Skriv index.html
        fs.writeFileSync(
            path.join(docsDir, "index.html"),
            html,
            "utf8"
        );

        // Skapa service worker
        const cacheName = `vinguide-${Date.now()}`;

        const swTemplate = fs.readFileSync(
            path.join(__dirname, "sw.js"),
            "utf8"
        );

        const sw = swTemplate.replace(
            "__CACHE_NAME__",
            cacheName
        );

        fs.writeFileSync(
            path.join(docsDir, "sw.js"),
            sw,
            "utf8"
        );

        console.log("index.html skapad");
        console.log("sw.js skapad");



}



main()
.catch(error => {

    console.error(
        "Fel:",
        error
    );

});