const axios = require("axios");
require("dotenv").config();

const BASE = "https://api-extern.systembolaget.se/sb-api-ecommerce";

const headers = {
    "ocp-apim-subscription-key": process.env.SYSTEMBOLAGET_KEY,
    "x-visitor-id": "67eede6abe2999b2",
    "referer": "https://www.systembolaget.se/",
    "user-agent": "Mozilla/5.0"
};


// Hämtar alla TSV-viner för en butik
async function getProductsFromStore(storeId, maxProducts = null) {

    let products = [];
    let page = 1;
    let more = true;


   while (more) {

    try {

        const response = await axios.get(
            `${BASE}/v2/productsearch/search`,
            {
                headers,
                params: {
                    page,
                    size: 30,
                    sortBy: "Score",
                    sortDirection: "Ascending",
                    categoryLevel1: "Vin",
                    assortmentText: "Tillfälligt sortiment",
                    storeId,
                    isInStoreAssortmentSearch: true
                }
            }
        );

console.log(data.metadata);
console.log(data.products.length);
        const pageProducts = response.data.products;
            const fs = require("fs");

            if (page === 1) {
                fs.writeFileSync(
                    "metadata.json",
                    JSON.stringify(response.data.metadata, null, 2)
                );
            }
            console.log(`Sida ${page}: ${pageProducts.length} produkter`);
        products.push(...pageProducts);

        if (maxProducts && products.length >= maxProducts) {
            products = products.slice(0, maxProducts);
            more = false;
        }

        if (pageProducts.length < 30) {
            more = false;
        } else {
            page++;
        }

    } catch (err) {

        console.log("========== FEL ==========");
        console.log("Sida:", page);

        if (err.config) {
            console.log("URL:", err.config.url);
            console.log("Params:", err.config.params);
        }

        if (err.response) {
            console.log("Status:", err.response.status);
            console.log(err.response.data);
        }

        throw err;
    }

}


    return products;
}


// Hämtar lager
async function getStock(storeId, productId) {

    const response = await axios.get(
        `${BASE}/v1/stockbalance/store/${storeId}/${productId}`,
        {
            headers
        }
    );

    return response.data;

}


// Hämtar alla butiker och slår ihop produkter
async function getAllProducts(stores, maxProducts = null) {

    const productMap = new Map();


    for (const store of stores) {

        console.log(`Hämtar ${store.name}...`);

        const products = await getProductsFromStore(store.id, maxProducts);


        for (const product of products) {

            if (!productMap.has(product.productId)) {

                productMap.set(product.productId, {

                    ...product,

                    stock: {}

                });

            }

        }

    }


    return Array.from(productMap.values());

}


// Lägger till lager från alla butiker
async function enrichProducts(products, stores) {


    for (const product of products) {


        for (const store of stores) {

            try {

                const stock = await getStock(
                    store.id,
                    product.productId
                );


                product.stock[store.id] = {

                    name: store.name,
                    amount: stock.stock,
                    shelf: stock.shelf

                };


            } catch {


                product.stock[store.id] = {

                    name: store.name,
                    amount: 0,
                    shelf: ""

                };

            }

        }

    }


    return products;

}


module.exports = {

    getAllProducts,
    enrichProducts

};