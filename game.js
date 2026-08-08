/*
    MAPTAP

    Five locations:
    1. Eiffel Tower
    2. Machu Picchu
    3. Mount Fuji
    4. Statue of Liberty
    5. Sydney Opera House

    Each round has 30 seconds.
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



/* =========================
   GAME STATE
========================= */


let gameLocations = [];

let currentRound = 0;

let totalScore = 0;

let currentLocation = null;

let guessMarker = null;

let answerMarker = null;

let connectingLine = null;


/*
    Timer state
*/

const ROUND_TIME = 30;

let timeLeft = ROUND_TIME;

let timer = null;



/* =========================
   HTML ELEMENTS
========================= */


const roundElement =
    document.getElementById(
        "round"
    );


const timerElement =
    document.getElementById(
        "timer"
    );


const scoreElement =
    document.getElementById(
        "score"
    );


const guessButton =
    document.getElementById(
        "guessButton"
    );


const questionElement =
    document.getElementById(
        "question"
    );


const resultOverlay =
    document.getElementById(
        "resultOverlay"
    );


const locationName =
    document.getElementById(
        "locationName"
    );


const pointsElement =
    document.getElementById(
        "points"
    );


const distanceElement =
    document.getElementById(
        "distance"
    );


const nextButton =
    document.getElementById(
        "nextButton"
    );


const finalOverlay =
    document.getElementById(
        "finalOverlay"
    );


const finalScore =
    document.getElementById(
        "finalScore"
    );


const restartButton =
    document.getElementById(
        "restartButton"
    );



/* =========================
   MAP
========================= */


const map = L.map(
    "map",
    {

        worldCopyJump: true,

        minZoom: 2,

        maxZoom: 18

    }
).setView(
    [20, 0],
    2
);



L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
    {
        maxZoom: 20,

        attribution:
            "&copy; OpenStreetMap contributors &copy; CARTO"
    }
).addTo(map);
document.getElementById("map").style.filter =
    "saturate(1.35) contrast(1.08)";



/* =========================
   SHUFFLE
========================= */


function shuffle(array) {

    return [...array].sort(
        () => Math.random() - 0.5
    );

}



/* =========================
   DISTANCE
========================= */


function distanceKm(
    point1,
    point2
) {

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
        (
            point2.lat -
            point1.lat
        ) *
        Math.PI /
        180;


    const deltaLon =
        (
            point2.lon -
            point1.lon
        ) *
        Math.PI /
        180;


    const a =
        Math.sin(
            deltaLat / 2
        ) ** 2 +

        Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(
            deltaLon / 2
        ) ** 2;


    return (
        2 *
        earthRadius *
        Math.asin(
            Math.sqrt(a)
        )
    );

}



/* =========================
   SCORE
========================= */


function calculateScore(
    distance
) {

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



/* =========================
   CLEAR MAP
========================= */


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



/* =========================
   TIMER
========================= */


function startTimer() {


    /*
        Stop any previous timer.
    */

    clearInterval(timer);


    /*
        Reset timer.
    */

    timeLeft =
        ROUND_TIME;


    timerElement.textContent =
        timeLeft;


    /*
        Start countdown.
    */

    timer =
        setInterval(
            function () {


                timeLeft--;


                timerElement.textContent =
                    timeLeft;


                /*
                    Time has expired.
                */

                if (
                    timeLeft <= 0
                ) {

                    clearInterval(
                        timer
                    );

                    timer = null;


                    timeUp();

                }


            },
            1000
        );

}



/* =========================
   TIME UP
========================= */


function timeUp() {


    /*
        Disable guessing.
    */

    guessButton.disabled =
        true;


    /*
        Show correct location.
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
        If the player had already
        clicked somewhere, show the
        line to the correct location.
    */

    if (guessMarker) {

        const guess =
            guessMarker.getLatLng();


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
            Zoom to show both points.
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

    }


    /*
        Show result.
    */

    locationName.textContent =
        currentLocation.name;


    pointsElement.textContent =
        "+0";


    distanceElement.textContent =
        "Time's up!";


    resultOverlay.classList.remove(
        "hidden"
    );

}



/* =========================
   START GAME
========================= */


function startGame() {


    /*
        Stop any old timer.
    */

    clearInterval(timer);

    timer = null;


    /*
        Randomize locations.
    */

    gameLocations = locations;
      //  shuffle(locations);


    currentRound = 0;

    totalScore = 0;


    scoreElement.textContent =
        "0";


    finalOverlay.classList.add(
        "hidden"
    );


    nextRound();

}



/* =========================
   NEXT ROUND
========================= */


function nextRound() {


    clearMapMarkers();


    resultOverlay.classList.add(
        "hidden"
    );


    /*
        Check whether all rounds
        have been completed.
    */

    if (
        currentRound >=
        gameLocations.length
    ) {

        clearInterval(timer);

        timer = null;

        showFinalScore();

        return;

    }


    /*
        Get current location.
    */

    currentLocation =
        gameLocations[
            currentRound
        ];


    currentRound++;


    /*
        Update round number.
    */

    roundElement.textContent =
        currentRound;


    /*
        IMPORTANT:
        Display the location
        the player needs to find.
    */

    questionElement.textContent =
        currentLocation.name;


    /*
        Disable GUESS until
        player clicks the map.
    */

    guessButton.disabled =
        true;


    /*
        Reset timer.
    */

    startTimer();


    /*
        Start with worldwide view.
    */

    map.setView(
        [20, 0],
        2,
        {
            animate: false
        }
    );

}



/* =========================
   MAP CLICK
========================= */


map.on(
    "click",
    function (event) {


        /*
            Don't allow clicking while
            result is displayed.
        */

        if (
            !resultOverlay.classList.contains(
                "hidden"
            )
        ) {

            return;

        }


        /*
            Remove old guess.
        */

        if (guessMarker) {

            map.removeLayer(
                guessMarker
            );

        }


        /*
            Add new guess.
        */

        guessMarker =
            L.marker(
                event.latlng
            ).addTo(map);


        guessMarker.bindTooltip(
            "Your guess"
        );


        /*
            Enable GUESS button.
        */

        guessButton.disabled =
            false;

    }
);



/* =========================
   GUESS
========================= */


guessButton.addEventListener(
    "click",
    function () {


        if (!guessMarker) {

            return;

        }


        /*
            Stop timer.
        */

        clearInterval(timer);

        timer = null;


        /*
            Get guess position.
        */

        const guess =
            guessMarker.getLatLng();


        /*
            Actual location.
        */

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
            Calculate points.
        */

        const points =
            calculateScore(
                distance
            );


        totalScore +=
            points;


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
            Draw line from guess
            to correct location.
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
            Zoom to show both.
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
            Update result.
        */

        locationName.textContent =
            currentLocation.name;


        pointsElement.textContent =
            "+" +
            points;


        if (
            distance < 1
        ) {

            distanceElement.textContent =
                Math.round(
                    distance * 1000
                ) +
                " m away";

        }

        else {

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


        /*
            Disable button.
        */

        guessButton.disabled =
            true;

    }
);



/* =========================
   NEXT BUTTON
========================= */


nextButton.addEventListener(
    "click",
    function () {

        nextRound();

    }
);



/* =========================
   FINAL SCORE
========================= */


function showFinalScore() {


    finalScore.textContent =
        totalScore.toLocaleString();


    finalOverlay.classList.remove(
        "hidden"
    );

}



/* =========================
   RESTART
========================= */


restartButton.addEventListener(
    "click",
    function () {

        startGame();

    }
);



/* =========================
   START
========================= */


startGame();
