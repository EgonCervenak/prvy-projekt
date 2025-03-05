document.getElementById("vypocetBtn").addEventListener("click", vypocitajMzdu);

let mzdaChart; // Premenná na uloženie inštancie grafu

// Funkcia na výpočet mzdy a výstup výsledkov
function vypocitajMzdu() {
    const typMzdy = document.querySelector('input[name="typMzdy"]:checked').value; // Získanie vybraného typu mzdy
    const zadanaSuma = parseFloat(document.getElementById("hodnotaMzdy").value); // Načítanie a konverzia zadanej sumy

    if (!isValidInput(zadanaSuma)) { // Kontrola platnosti vstupu
        alert("Prosím, zadaj platné číslo!");
        return;
    }

    // Výpočty pre hrubú mzdu, odvody a daň
    const hrubaMzda = vypocitajHrubuMzdu(typMzdy, zadanaSuma);
    const zamestnanecOdvody = vypocitajOdvodyZamestnanca(hrubaMzda);
    const danZamestnanec = vypocitajDan(hrubaMzda, zamestnanecOdvody);
    const cistaMzda = hrubaMzda - zamestnanecOdvody.celkom - danZamestnanec;

    const zamestnavatelOdvody = vypocitajOdvodyZamestnavatela(hrubaMzda);
    const superHrubaMzda = hrubaMzda + zamestnavatelOdvody.celkom;

    // Zobrazenie výsledkov a aktualizácia grafu
    zobrazVysledky({ zamestnanecOdvody, danZamestnanec, cistaMzda, zamestnavatelOdvody, superHrubaMzda });
    aktualizujGraf(hrubaMzda, cistaMzda, danZamestnanec, zamestnanecOdvody.celkom, zamestnavatelOdvody.celkom);
}

// Funkcia na overenie platnosti zadanej sumy
function isValidInput(suma) {
    return !isNaN(suma) && suma > 0;
}

// Funkcia na výpočet hrubej mzdy podľa zadaného typu
function vypocitajHrubuMzdu(typMzdy, suma) {
    const konverzneFaktory = { "hruba": 1, "cista": 1 / 0.76, "superhruba": 1 / 1.35 };
    return suma * (konverzneFaktory[typMzdy] || 1);
}

// Funkcia na výpočet odvodov zamestnanca
function vypocitajOdvodyZamestnanca(hrubaMzda) {
    return {
        zdravotne: hrubaMzda * 0.04,
        nemocenske: hrubaMzda * 0.015,
        starobne: hrubaMzda * 0.05,
        invalidne: hrubaMzda * 0.03,
        celkom: hrubaMzda * (0.04 + 0.015 + 0.05 + 0.03)
    };
}

// Funkcia na výpočet odvodov zamestnávateľa
function vypocitajOdvodyZamestnavatela(hrubaMzda) {
    return {
        zdravotne: hrubaMzda * 0.10,
        nemocenske: hrubaMzda * 0.015,
        starobne: hrubaMzda * 0.20,
        invalidne: hrubaMzda * 0.05,
        celkom: hrubaMzda * (0.10 + 0.015 + 0.20 + 0.05)
    };
}

// Funkcia na výpočet dane z príjmu zamestnanca
function vypocitajDan(hrubaMzda, odvody) {
    return (hrubaMzda - odvody.celkom - 410) * 0.19;
}

// Funkcia na zobrazenie vypočítaných hodnôt v HTML
function zobrazVysledky({ zamestnanecOdvody, danZamestnanec, cistaMzda, zamestnavatelOdvody, superHrubaMzda }) {
    nastavText("zdravotneZamestnanec", zamestnanecOdvody.zdravotne);
    nastavText("nemocenskeZamestnanec", zamestnanecOdvody.nemocenske);
    nastavText("starobneZamestnanec", zamestnanecOdvody.starobne);
    nastavText("invalidneZamestnanec", zamestnanecOdvody.invalidne);
    nastavText("danZamestnanec", danZamestnanec);
    nastavText("cistaMzda", cistaMzda);
    nastavText("zdravotneZamestnavatel", zamestnavatelOdvody.zdravotne);
    nastavText("nemocenskeZamestnavatel", zamestnavatelOdvody.nemocenske);
    nastavText("starobneZamestnavatel", zamestnavatelOdvody.starobne);
    nastavText("invalidneZamestnavatel", zamestnavatelOdvody.invalidne);
    nastavText("superHrubaMzda", superHrubaMzda);
}

// Pomocná funkcia na nastavenie textového obsahu HTML prvkov
function nastavText(id, hodnota) {
    document.getElementById(id).textContent = hodnota.toFixed(2) + " €";
}

// Funkcia na aktualizáciu grafu s rozdelením mzdy
function aktualizujGraf(hruba, cista, dane, odvodyZamestnanec, odvodyZamestnavatel) {
    let ctx = document.getElementById("mzdaChart").getContext("2d");

    if (mzdaChart) {
        mzdaChart.destroy();
    }

    let total = hruba + odvodyZamestnavatel;
    let dataPercent = [
        (cista / total * 100).toFixed(2),
        (dane / total * 100).toFixed(2),
        (odvodyZamestnanec / total * 100).toFixed(2),
        (odvodyZamestnavatel / total * 100).toFixed(2)
    ];

    mzdaChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Čistá mzda", "Daň z príjmu", "Odvody zamestnanca", "Odvody zamestnávateľa"],
            datasets: [{
                data: dataPercent,
                backgroundColor: ["#4CAF50", "#FF5733", "#FFC300", "#3498DB"],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            let index = tooltipItem.dataIndex;
                            let absoluteValues = [cista, dane, odvodyZamestnanec, odvodyZamestnavatel];
                            return tooltipItem.label + ": " + absoluteValues[index].toFixed(2) + " € (" + dataPercent[index] + "%)";
                        }
                    }
                }
            }
        }
    });
}
