document.getElementById("vypocetBtn").addEventListener("click", vypocitajMzdu);

let mzdaChart;

function vypocitajMzdu() {
    let typMzdy = document.querySelector('input[name="typMzdy"]:checked').value;
    let zadanaSuma = parseFloat(document.getElementById("hodnotaMzdy").value);

    if (isNaN(zadanaSuma) || zadanaSuma <= 0) {
        alert("Prosím, zadaj platné číslo!");
        return;
    }

    let hrubaMzda, cistaMzda, superHrubaMzda;
    let zdravotneZamestnanec, socialneZamestnanec, danZamestnanec;
    let zdravotneZamestnavatel, socialneZamestnavatel;

    if (typMzdy === "hruba") {
        hrubaMzda = zadanaSuma;
    } else if (typMzdy === "cista") {
        hrubaMzda = zadanaSuma / 0.76;
    } else if (typMzdy === "superhruba") {
        hrubaMzda = zadanaSuma / 1.35;
    }

    zdravotneZamestnanec = hrubaMzda * 0.04;
    socialneZamestnanec = hrubaMzda * 0.095;
    danZamestnanec = (hrubaMzda - zdravotneZamestnanec - socialneZamestnanec - 410) * 0.19;
    cistaMzda = hrubaMzda - zdravotneZamestnanec - socialneZamestnanec - danZamestnanec;
    zdravotneZamestnavatel = hrubaMzda * 0.10;
    socialneZamestnavatel = hrubaMzda * 0.25;
    superHrubaMzda = hrubaMzda + zdravotneZamestnavatel + socialneZamestnavatel;

    document.getElementById("zdravotneZamestnanec").textContent = zdravotneZamestnanec.toFixed(2) + " €";
    document.getElementById("socialneZamestnanec").textContent = socialneZamestnanec.toFixed(2) + " €";
    document.getElementById("danZamestnanec").textContent = danZamestnanec.toFixed(2) + " €";
    document.getElementById("cistaMzda").textContent = cistaMzda.toFixed(2) + " €";
    document.getElementById("zdravotneZamestnavatel").textContent = zdravotneZamestnavatel.toFixed(2) + " €";
    document.getElementById("socialneZamestnavatel").textContent = socialneZamestnavatel.toFixed(2) + " €";
    document.getElementById("superHrubaMzda").textContent = superHrubaMzda.toFixed(2) + " €";

    aktualizujGraf(hrubaMzda, cistaMzda, danZamestnanec, zdravotneZamestnanec + socialneZamestnanec, zdravotneZamestnavatel + socialneZamestnavatel);
}

function aktualizujGraf(hruba, cista, dane, odvodyZamestnanec, odvodyZamestnavatel) {
    let ctx = document.getElementById("mzdaChart").getContext("2d");

    if (mzdaChart) {
        mzdaChart.destroy();
    }

    mzdaChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Čistá mzda", "Daň z príjmu", "Odvody zamestnanca", "Odvody zamestnávateľa"],
            datasets: [{
                data: [cista, dane, odvodyZamestnanec, odvodyZamestnavatel],
                backgroundColor: ["#4CAF50", "#FF5733", "#FFC300", "#3498DB"],
            }]
        },
        options: {
            responsive: false,
            plugins: {
                tooltip: { enabled: false },
                datalabels: {
                    color: '#fff',
                    formatter: (value, context) => {
                        let total = context.chart.data.datasets[0].data.reduce((acc, val) => acc + val, 0);
                        let percentage = (value / total * 100).toFixed(1) + "%";
                        return percentage;
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// Načítanie pluginu pre zobrazenie percent
const script = document.createElement('script');
script.src = "https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels";
document.head.appendChild(script);