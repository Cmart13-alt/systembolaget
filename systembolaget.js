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


async function main() {


    console.log("Hämtar sortiment...");


    let products = await getAllProducts(stores);


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


    const filename =
        path.join(
            __dirname,
            "docs/index.html"
        );



    fs.writeFileSync(
        filename,
        html,
        "utf8"
    );



    console.log(
        "index.html skapad"
    );



    /*
       Öppna automatiskt
    */


    exec(
        `"${filename}"`
    );



}



main()
.catch(error => {

    console.error(
        "Fel:",
        error
    );

});