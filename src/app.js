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

    updateStoreSummary();
    updateTypeSummary();

}

function updateStoreSummary(){

    const mainTypes = [
        "Rött vin",
        "Vitt vin",
        "Rosévin",
        "Mousserande vin"
    ];

    const text =
        document.getElementById("search")
        .value
        .toLowerCase();

    const cards =
        [...document.querySelectorAll(".wine-card")];

    const filtered =
        cards.filter(card => {

            const type = card.dataset.type;

            let typeOK = true;

            if(currentType === "Övriga"){

                typeOK =
                    !mainTypes.includes(type);

            }
            else if(currentType !== "Alla"){

                typeOK =
                    type === currentType;

            }

            const searchOK =
                !text ||
                card.innerText
                    .toLowerCase()
                    .includes(text);

            return typeOK && searchOK;

        });

    document
        .querySelectorAll("[data-store]")
        .forEach(box=>{

            const store =
                box.dataset.store;

            let count;

            if(store==="Alla"){

                count = filtered.length;

            }
            else{

                count =
                    filtered.filter(card=>
                        Number(card.dataset[store])>0
                    ).length;

            }

            document.getElementById(
                `count-store-${store}`
            ).textContent = count;

        });

}

function updateTypeSummary(){

    const mainTypes = [
        "Rött vin",
        "Vitt vin",
        "Rosévin",
        "Mousserande vin"
    ];

    const text =
        document.getElementById("search")
        .value
        .toLowerCase();

    const cards =
        [...document.querySelectorAll(".wine-card")];

    const filtered =
        cards.filter(card=>{

            let storeOK = true;

            if(currentStore !== "Alla"){

                storeOK =
                    Number(
                        card.dataset[currentStore]
                    ) > 0;

            }

            const searchOK =
                !text ||
                card.innerText
                    .toLowerCase()
                    .includes(text);

            return storeOK && searchOK;

        });

    document
        .querySelectorAll("[data-typefilter]")
        .forEach(box=>{

            const type =
                box.dataset.typefilter;

            let count;

            if(type==="Alla"){

                count = filtered.length;

            }
            else if(type==="Övriga"){

                count =
                    filtered.filter(card=>
                        !mainTypes.includes(
                            card.dataset.type
                        )
                    ).length;

            }
            else{

                count =
                    filtered.filter(card=>
                        card.dataset.type===type
                    ).length;

            }

            document.getElementById(
                `count-type-${type}`
            ).textContent = count;

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