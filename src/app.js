let currentType = "Alla";
let currentStore = "Alla";

const search = document.getElementById("search");


search.addEventListener("input", function(){

    applyFilters();

});


function filterType(type){

    currentType = type;

    document
        .querySelectorAll("[data-typefilter]")
        .forEach(box => {

            box.classList.remove("active");

        });

    document
        .querySelector(
            `[data-typefilter="${type}"]`
        )
        ?.classList.add("active");

    applyFilters();

}

function filterStore(store){

    currentStore = store;

    document
        .querySelectorAll("[data-store]")
        .forEach(box => {

            box.classList.remove("active");

        });

    document
        .querySelector(
            `[data-store="${store}"]`
        )
        ?.classList.add("active");

    applyFilters();

}

function applyFilters(){

    const text =
        document
        .getElementById("search")
        .value
        .toLowerCase();


    const mainTypes = [
        "Rött vin",
        "Vitt vin",
        "Rosévin",
        "Mousserande vin"
    ];


    const cards =
        document.querySelectorAll(".wine-card");


    cards.forEach(card => {


        const cardType =
            card.dataset.type;


        const content =
            card.innerText.toLowerCase();


        let typeOK = true;
        let searchOK = true;
        let storeOK = true;
    
        // Typfilter

        if(currentType === "Övriga"){

            typeOK =
                !mainTypes.includes(cardType);

        }

        else if(currentType !== "Alla"){

            typeOK =
                cardType === currentType;

        }

        // Butiksfilter

        if(currentStore !== "Alla"){

            const stock =
                Number(
                    card.dataset[currentStore] || 0
                );

            storeOK = stock > 0;

        }

        // Sökfilter

        if(text){

            searchOK =
                content.includes(text);

        }


        if(typeOK && searchOK && storeOK){

            card.style.display="block";

        }
        else {

            card.style.display="none";

        }


    });
    
    updateSummary();

}

function updateSummary() {

    const visible =
        [...document.querySelectorAll(".wine-card")]
            .filter(card => card.style.display !== "none");

    //
    // Butiker
    //

    document
        .querySelectorAll("[data-store]")
        .forEach(box => {

            const store = box.dataset.store;

            let count;

            if (store === "Alla") {

                count = visible.length;

            } else {

                count = visible.filter(card =>
                    Number(card.dataset[store]) > 0
                ).length;

            }

            const strong =
                document.getElementById(
                    `count-store-${store}`
                );

            if (strong)
                strong.textContent = count;

        });

    //
    // Vintyper
    //

    const mainTypes = [
        "Rött vin",
        "Vitt vin",
        "Rosévin",
        "Mousserande vin"
    ];

    document
        .querySelectorAll("[data-typefilter]")
        .forEach(box => {

            const type = box.dataset.typefilter;

            let count;

            if (type === "Alla") {

                count = visible.length;

            }
            else if (type === "Övriga") {

                count =
                    visible.filter(card =>
                        !mainTypes.includes(card.dataset.type)
                    ).length;

            }
            else {

                count =
                    visible.filter(card =>
                        card.dataset.type === type
                    ).length;

            }

            const strong =
                document.getElementById(
                    `count-type-${type}`
                );

            if (strong)
                strong.textContent = count;

        });

}

function showAll(){

    currentType = "Alla";

    document
        .querySelectorAll("[data-typefilter]")
        .forEach(box => {

            box.classList.remove("active");

        });

    document
        .querySelector(
            '[data-typefilter="Alla"]'
        )
        ?.classList.add("active");

    applyFilters();

}

function sortProducts(type){

    const container =
        document.getElementById("products");


    const cards =
        Array.from(
            container.querySelectorAll(".wine-card")
        );


    cards.sort((a,b)=>{


        if(type==="name"){

            return a.dataset.name.localeCompare(
                b.dataset.name,
                "sv"
            );

        }


        if(type==="priceAsc"){

            return Number(a.dataset.price)
                -
                Number(b.dataset.price);

        }


        if(type==="priceDesc"){

            return Number(b.dataset.price)
                -
                Number(a.dataset.price);

        }


        if(type==="vintage"){

            return Number(b.dataset.vintage || 0)
                -
                Number(a.dataset.vintage || 0);

        }


        if(type==="alcohol"){

            return Number(b.dataset.alcohol)
                -
                Number(a.dataset.alcohol);

        }


    });


    cards.forEach(card =>
        container.appendChild(card)
    );
    applyFilters();
}

const sortButton =
    document.getElementById("sortButton");

const sortOptions =
    document.getElementById("sortOptions");

const sortLabel =
    document.getElementById("sortLabel");

sortButton.onclick = () => {

    sortOptions.classList.toggle("open");

};

sortOptions
.querySelectorAll("button")
.forEach(button=>{

    button.onclick = () => {

        sortProducts(
            button.dataset.sort
        );

        sortLabel.textContent =
            button.textContent;

        sortOptions.classList.remove("open");

    };

});

document.addEventListener("click",e=>{

    if(!e.target.closest(".sort-menu")){

        sortOptions.classList.remove("open");

    }

});


showAll();
filterStore("Alla");

if ("serviceWorker" in navigator) {

    window.addEventListener("load", async () => {

        try {

            const registration =
                await navigator.serviceWorker.register("./sw.js");

            console.log("Service Worker registrerad.");

            registration.update();

        }
        catch (err) {

            console.error(err);

        }

    });

}