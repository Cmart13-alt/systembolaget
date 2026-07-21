function createSystembolagetLink(product) {

    const slug = [
        product.productNameBold,
        product.productNameThin ?? ""
    ]
        .join(" ")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");


    return `https://www.systembolaget.se/produkt/vin/${slug}-${product.productNumber}/`;

}



function createVivinoLink(product) {

    let query = product.productNameBold;

    if (product.productNameThin) {
        query += " " + product.productNameThin;
    }

    if (product.producerName &&
        !query.toLowerCase().includes(product.producerName.toLowerCase())) {
        query += " " + product.producerName;
    }

    query += " site:vivino.com";

    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}


function escapeHtml(text) {

    if (!text) return "";

    return String(text)

        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}




function formatPrice(price) {

    if (!price) return "";

    return `${price} kr`;

}




function formatGrapes(grapes) {

    if (!grapes || grapes.length === 0) {

        return "Ej angivet";

    }


    return grapes.join(", ");

}




module.exports = {

    createVivinoLink,

    createSystembolagetLink,

    escapeHtml,

    formatPrice,

    formatGrapes

};