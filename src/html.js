const fs = require("fs");
const path = require("path");

function generateReport(products, stores) {

    const css = fs.readFileSync(
        path.join(__dirname, "style.css"),
        "utf8"
    );

    const js = fs.readFileSync(
        path.join(__dirname, "app.js"),
        "utf8"
    );
    const now = new Date();

    const updated =
        now.toLocaleDateString("sv-SE", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        })
        + " "
        +
        now.toLocaleTimeString("sv-SE", {
            hour: "2-digit",
            minute: "2-digit"
        });

    const cards = products
        .map(product => createProductCard(product, stores))
        .join("\n");

    return `
<!DOCTYPE html>
<html lang="sv">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1">

<meta name="theme-color" content="#0b6b3a">

<meta name="description" content="Tillfälligt sortiment på Systembolaget i Växjö">

<meta name="mobile-web-app-capable" content="yes">

<meta name="apple-mobile-web-app-capable" content="yes">

<meta name="apple-mobile-web-app-status-bar-style" content="default">

<meta name="apple-mobile-web-app-title" content="Vinguide">

<link rel="manifest" href="manifest.json">

<link rel="icon" href="icon-192.png" type="image/png">

<title>Vinguide - Växjö</title>

<style>

${css}

</style>

</head>

<body>

<header class="header">

    <h1>
    <span class="emoji">🍷</span>
    <span>Tillfälligt sortiment</span>
    </h1>

    <p>
        Växjöbutikerna · Tillfälligt sortiment
    </p>
    <p class="updated">
    🕒 Senast uppdaterad: ${updated}
    </p>

    <div class="summary">

       
        
        <div class="summary-box filter"
        data-typefilter="Alla"
        onclick="showAll()">

        <strong id="count-type-Alla">>${products.length}</strong>
        <span>🍷 Alla viner</span>

        </div>

        <div class="summary-box filter"
        data-typefilter="Rött vin"
        onclick="filterType('Rött vin')">

        <strong id="count-type-Rött vin">${countWineType(products,"Rött vin")}</strong>
        <span>🍷 Röda viner</span>

        </div>


        <div class="summary-box filter"
        data-typefilter="Vitt vin"
        onclick="filterType('Vitt vin')">

        <strong id="count-type-Vitt vin">${countWineType(products,"Vitt vin")}</strong>
        <span>🥂 Vita viner</span>

        </div>


        <div class="summary-box filter"
        data-typefilter="Rosévin"
        onclick="filterType('Rosévin')">

        <strong id="count-type-Rosévin">${countWineType(products,"Rosévin")}</strong>
        <span>🌸 Rosé</span>

        </div>


        <div class="summary-box filter"
        data-typefilter="Mousserande vin"
        onclick="filterType('Mousserande vin')">

        <strong id="count-type-Mousserande vin">${countWineType(products,"Mousserande vin")}</strong>
        <span>🍾 Mousserande</span>

        </div>
        <div class="summary-box filter"
        data-typefilter="Övriga"
        onclick="filterType('Övriga')">

        <strong id="count-type-Övriga">${countWineType(products,"Övriga")}</strong>
        <span>🍷 Övriga</span>

        </div>


    </div>
    <div class="summary store-summary">

        <div class="summary-box filter"
        data-store="Alla"
        onclick="filterStore('Alla')">

            <strong id="count-store-Alla">${products.length}</strong>
            <span>🏬 Alla butiker</span>

        </div>

        <div class="summary-box filter"
        data-store="0701"
        onclick="filterStore('0701')">

            <strong id="count-store-0701">${countStore(products,"0701")}</strong>
            <span>🏬 Växjö City</span>

        </div>

        <div class="summary-box filter"
        data-store="0707"
        onclick="filterStore('0707')">

            <strong id="count-store-0707">${countStore(products,"0707")}</strong>
            <span>🏬 Grand Samarkand</span>

        </div>

        <div class="summary-box filter"
        data-store="0710"
        onclick="filterStore('0710')">

            <strong id="count-store-0710">${countStore(products,"0710")}</strong>
            <span>🏬 Norremark</span>

        </div>

    </div>    

</header>


<div class="toolbar">

    <div class="search-area">

        <input
            id="search"
            placeholder="Sök vin, producent eller land..."
        >

    </div>

    <div class="sort-menu">

        <button
            id="sortButton"
            class="sort-button">

            ⇅
            <span id="sortLabel">Namn</span>

        </button>

        <div
            id="sortOptions"
            class="sort-options">

            <button data-sort="name">
                Namn
            </button>

            <button data-sort="priceAsc">
                Pris ↑
            </button>

            <button data-sort="priceDesc">
                Pris ↓
            </button>

            <button data-sort="vintage">
                Årgång
            </button>

            <button data-sort="alcohol">
                Alkoholhalt
            </button>

        </div>

    </div>

</div>



<main class="products" id="products">

${cards}

</main>


<script>

${js}

</script>


</body>

</html>
`;

}

function formatShelf(shelf) {

    if (!shelf) return "-";

    return shelf
        .toUpperCase()
        .replace(/-\d{2}$/, "");

}

function createProductCard(product, stores) {


    const image =
        product.images?.[0]?.imageUrl
        ? `${product.images[0].imageUrl}_400.png`
        : "";


    const grapes =
        product.grapes?.join(", ") || "Ej angivet";


    const wineType =
        product.categoryLevel2
        ?.toLowerCase()
        .replaceAll(" ","-") || "other";



    const stockRows = stores.map(store => {


        const stock = product.stock?.[store.id] || {

            amount:0,
            shelf:""

        };


        let status;


        if(stock.amount > 5){

            status = "good";

        } 
        else if(stock.amount > 0){

            status = "low";

        }
        else {

            status = "empty";

        }



        return `

        <tr>

            <td>${store.name}</td>

            <td class="${status}">
                ${stock.amount > 0 
                    ? stock.amount + " st"
                    : "Slut"}
            </td>

            <td>${formatShelf(stock.shelf)}</td>

        </tr>

        `;


    }).join("");



    return `


<article class="wine-card ${wineType}"

data-type="${product.categoryLevel2}"

data-name="${product.productNameBold} ${product.productNameThin ?? ""}"

data-price="${product.price}"

data-vintage="${product.vintage ?? 0}"

data-alcohol="${product.alcoholPercentage}"

data-0701="${product.stock["0701"]?.amount ?? 0}"
data-0707="${product.stock["0707"]?.amount ?? 0}"
data-0710="${product.stock["0710"]?.amount ?? 0}"

>

<div class="image-area">

    <img src="${image}" alt="">

</div>



<div class="wine-info">


<h2>

${product.productNameBold}

${product.productNameThin ?? ""}

</h2>



<div class="tags">


<span>
🌎 ${product.country}
</span>


${product.originLevel1 
    ? `<span>📍 ${product.originLevel1}</span>`
    : ""}

<span>
🤪 ${product.alcoholPercentage} %
</span>    

<span>
💵 ${product.price} kr
</span>


${product.vintage
    ? `<span>📅 ${product.vintage}</span>`
    : ""}


</div>


<p class="wine-info2">

<b>🧑‍🌾 Producent</b><br>

${product.producerName}

</p>



<p class="wine-info2">

<b>🍇 Druvor</b><br>

${grapes}

</p>



<p class="wine-info2">

<b>😋 Smak</b><br>

${product.taste || "Ingen smakbeskrivning"}

</p>

<p>
<b>📦 Lager</b>
</p>

<table class="stock-table">


<tr>

<th>Butik</th>
<th>Antal</th>
<th>Hylla</th>

</tr>


${stockRows}


</table>



<div class="buttons">


<a href="${product.systembolaget || "#"}"
target="_blank">

🛒 Systembolaget

</a>



<a href="${product.vivino || "#"}"
target="_blank">

⭐ Vivino

</a>


</div>


</div>


</article>


`;

}




function countCountries(products){

    return new Set(
        products.map(p => p.country)
    ).size;

}



function countProducers(products){

    return new Set(
        products.map(p => p.producerName)
    ).size;

}

function countWineType(products,type){

    const mainTypes = [
        "Rött vin",
        "Vitt vin",
        "Rosévin",
        "Mousserande vin"
    ];


    if(type === "Övriga"){

        return products.filter(p =>
            !mainTypes.includes(p.categoryLevel2)
        ).length;

    }


    return products.filter(p =>
        p.categoryLevel2 === type
    ).length;

}

function countStore(products, storeId){

    return products.filter(product => {

        const stock =
            product.stock?.[storeId]?.amount || 0;

        return stock > 0;

    }).length;

}

module.exports = {

    generateReport

};
