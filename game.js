/*
    MAPTAP

    Five locations:
    1. Eiffel Tower
    2. Machu Picchu
    3. Mount Fuji
    4. Statue of Liberty
    5. Sydney Opera House
*/


const locations = [

    {
        name: "Eiffel Tower, Paris",
        lat: 48.8584,
        lon: 2.2945
    },

    {
        name: "Machu Picchu, Peru",
        lat: -13.1631,
        lon: -72.5450
    },

    {
        name: "Mount Fuji, Japan",
        lat: 35.3606,
        lon: 138.7274
    },

    {
        name: "Statue of Liberty, New York",
        lat: 40.6892,
        lon: -74.0445
    },

    {
        name: "Sydney Opera House, Australia",
        lat: -33.8568,
        lon: 151.2153
    }

];


/* -------------------------
   GAME STATE
------------------------- */

let gameLocations = [];

let currentRound = 0;

let totalScore = 0;

let currentLocation = null;

let guessMarker = null;

let answerMarker = null;

let connectingLine = null;


/* -------------------------
   HTML ELEMENTS
------------------------- */

const roundElement =
    document.getElementById("round");

const scoreElement =
    document.getElementById("score");

const guessButton =
    document.getElementById("guessButton");

const resultOverlay =
    document.getElementById("resultOverlay");

const locationName =
    document.getElementById("locationName");

const pointsElement =
    document.getElementById("points");

const distanceElement =
    document.getElementById("distance");

const nextButton =
    document.getElementById("nextButton");

const finalOverlay =
    document.getElementById("finalOverlay");

const finalScore =
    document.getElementById("finalScore");

const restartButton =
    document.getElementById("restartButton");


/* -------------------------
   MAP
------------------------- */

const map = L.map("map", {

    worldCopyJump: true,

    minZoom: 2,

    maxZoom: 18

}).setView(
    [20, 0],
    2
);


L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 19,

        attribution:
            "&copy; OpenStreetMap contributors"
    }
).addTo(map);


/* -------------------------
   SHUFFLE
------------------------- */

function shuffle(array) {

    return [...array].sort(
        () => Math.random() - 0.5
    );

}


/* -------------------------
   HAVERSINE DISTANCE
------------------------- */

function distanceKm(point1, point2) {

    const earthRadius = 6371;

    const lat1 =
        point1.lat *
        Math.PI /
        180;

    const lat2 =
        point2.lat *
        Math.PI /
        180;

    const deltaLat =
        (point2.lat - point1.lat) *
        Math.PI /
        180;

    const deltaLon =
        (point2.lon - point1.lon) *
        Math.PI /
        180;


    const a =
        Math.sin(deltaLat / 2) ** 2 +

        Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLon / 2) ** 2;


    return (
        2 *
        earthRadius *
        Math.asin(
            Math.sqrt(a)
        )
    );

}


/* -------------------------
   SCORE
------------------------- */

function calculateScore(distance) {

    /*
        1000 points at the exact
        location.

        Score decreases exponentially
        with distance.
    */

    const score =
        1000 *
        Math.exp(
            -distance / 1800
        );


    return Math.max(
        0,
        Math.round(score)
    );

}


/* -------------------------
   CLEAR MAP
------------------------- */

function clearMapMarkers() {

    if (guessMarker) {

        map.removeLayer(
            guessMarker
        );

        guessMarker = null;
    }


    if (answerMarker) {

        map.removeLayer(
            answerMarker
        );

        answerMarker = null;
    }


    if (connectingLine) {

        map.removeLayer(
            connectingLine
        );

        connectingLine = null;
    }

}


/* -------------------------
   START GAME
------------------------- */

function startGame() {

    gameLocations =
        shuffle(locations);

    currentRound = 0;

    totalScore = 0;

    scoreElement.textContent =
        "0";

    finalOverlay.classList.add(
        "hidden"
    );

    nextRound();

}


/* -------------------------
   NEXT ROUND
------------------------- */

function nextRound() {

    clearMapMarkers();

    resultOverlay.classList.add(
        "hidden"
    );


    if (
        currentRound >=
        gameLocations.length
    ) {

        showFinalScore();

        return;
    }


    currentLocation =
        gameLocations[
            currentRound
        ];


    currentRound++;


    roundElement.textContent =
        currentRound;


    guessButton.disabled = true;


    /*
        Start each round with
        a worldwide view.
    */

    map.setView(
        [20, 0],
        2,
        {
            animate: false
        }
    );

}


/* -------------------------
   MAP CLICK
------------------------- */

map.on(
    "click",
    function (event) {

        /*
            Don't allow clicking while
            the result window is open.
        */

        if (
            !resultOverlay.classList.contains(
                "hidden"
            )
        ) {

            return;
        }


        /*
            Remove previous guess.
        */

        if (guessMarker) {

            map.removeLayer(
                guessMarker
            );

        }


        /*
            Create new guess marker.
        */

        guessMarker =
            L.marker(
                event.latlng
            ).addTo(map);


        guessMarker.bindTooltip(
            "Your guess"
        );


        /*
            Enable the GUESS button.
        */

        guessButton.disabled =
            false;

    }
);


/* -------------------------
   GUESS BUTTON
------------------------- */

guessButton.addEventListener(
    "click",
    function () {

        if (!guessMarker) {

            return;
        }


        const guess =
            guessMarker.getLatLng();


        const actual = {

            lat:
                currentLocation.lat,

            lon:
                currentLocation.lon

        };


        /*
            Calculate distance.
        */

        const distance =
            distanceKm(
                {
                    lat:
                        guess.lat,

                    lon:
                        guess.lng
                },
                actual
            );


        /*
            Calculate score.
        */

        const points =
            calculateScore(
                distance
            );


        totalScore += points;


        scoreElement.textContent =
            totalScore;


        /*
            Show actual location.
        */

        answerMarker =
            L.marker(
                [
                    currentLocation.lat,
                    currentLocation.lon
                ]
            ).addTo(map);


        answerMarker
            .bindPopup(
                currentLocation.name
            )
            .openPopup();


        /*
            Draw line between
            guess and answer.
        */

        connectingLine =
            L.polyline(
                [
                    [
                        guess.lat,
                        guess.lng
                    ],

                    [
                        currentLocation.lat,
                        currentLocation.lon
                    ]
                ],
                {
                    weight: 3,

                    dashArray:
                        "8 8"
                }
            ).addTo(map);


        /*
            Zoom so both points
            are visible.
        */

        const bounds =
            L.latLngBounds(
                [
                    [
                        guess.lat,
                        guess.lng
                    ],

                    [
                        currentLocation.lat,
                        currentLocation.lon
                    ]
                ]
            );


        map.fitBounds(
            bounds,
            {
                padding:
                    [80, 180],

                maxZoom: 7
            }
        );


        /*
            Update result window.
        */

        locationName.textContent =
            currentLocation.name;


        pointsElement.textContent =
            "+" +
            points;


        if (distance < 1) {

            distanceElement.textContent =
                Math.round(
                    distance * 1000
                ) +
                " m away";

        } else {

            distanceElement.textContent =
                Math.round(
                    distance
                ) +
                " km away";

        }


        /*
            Show result.
        */

        resultOverlay.classList.remove(
            "hidden"
        );


        guessButton.disabled =
            true;

    }
);


/* -------------------------
   NEXT BUTTON
------------------------- */

nextButton.addEventListener(
    "click",
    function () {

        nextRound();

    }
);


/* -------------------------
   FINAL SCORE
------------------------- */

function showFinalScore() {

    finalScore.textContent =
        totalScore.toLocaleString();


    finalOverlay.classList.remove(
        "hidden"
    );

}


/* -------------------------
   RESTART
------------------------- */

restartButton.addEventListener(
    "click",
    function () {

        startGame();

    }
);


/* -------------------------
   START
------------------------- */

startGame();
