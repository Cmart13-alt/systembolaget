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


    const producer = (product.producerName ?? "")
        .replace(/\b(SRL|AB|Ltd|SAS|SA|SPA|LLC|Inc)\b/gi, "")
        .trim();


    const query = [

        producer,

        product.productNameBold,

        product.productNameThin ?? "",

        product.vintage ?? ""

    ]
    .filter(Boolean)
    .join(" ");



    return `https://www.vivino.com/sv/explore?search_term=${encodeURIComponent(query)}`;

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