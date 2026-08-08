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
    Timer
*/

const ROUND_TIME = 30;

let timeLeft = ROUND_TIME;

let timer = null;



/* =========================
   HTML ELEMENTS
========================= */


const startOverlay =
    document.getElementById(
        "startOverlay"
    );


const startButton =
    document.getElementById(
        "startButton"
    );


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


const questionElement =
    document.getElementById(
        "question"
    );


const guessButton =
    document.getElementById(
        "guessButton"
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



/*
    Dark map WITHOUT labels.
*/

L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
    {

        maxZoom: 20,

        attribution:
            "&copy; OpenStreetMap contributors &copy; CARTO"

    }
).addTo(map);



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
        If the player placed a guess,
        draw a line to the answer.
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
        Stop any previous timer.
    */

    clearInterval(timer);

    timer = null;


    /*
        Randomize locations.
    */

    gameLocations =
        shuffle(locations);


    currentRound = 0;

    totalScore = 0;


    scoreElement.textContent =
        "0";


    finalOverlay.classList.add(
        "hidden"
    );


    /*
        Clear any old location
        text before the first round.
    */

    questionElement.textContent =
        "";


    /*
        Start the first round.
    */

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
        are complete.
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
        Select location.
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
        Display the location ONLY
        when the round starts.
    */

    questionElement.textContent =
        currentLocation.name;


    /*
        Disable GUESS until the
        player clicks the map.
    */

    guessButton.disabled =
        true;


    /*
        Start 30-second timer.
    */

    startTimer();


    /*
        Worldwide starting view.
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
            Ignore clicks while
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
            Remove previous guess.
        */

        if (guessMarker) {

            map.removeLayer(
                guessMarker
            );

        }


        /*
            Create new guess.
        */

        guessMarker =
            L.marker(
                event.latlng
            ).addTo(map);


        guessMarker.bindTooltip(
            "Your guess"
        );


        /*
            Enable GUESS.
        */

        guessButton.disabled =
            false;

    }
);



/* =========================
   GUESS BUTTON
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
            Get guess.
        */

        const guess =
            guessMarker.getLatLng();


        /*
            Correct location.
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
            Calculate score.
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
            Update result screen.
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
            Disable GUESS.
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
   START BUTTON
========================= */


/*
    IMPORTANT:
    The game does NOT call
    startGame() automatically.

    The first location is therefore
    not selected until START GAME
    is pressed.
*/

startButton.addEventListener(
    "click",
    function () {


        /*
            Hide start screen.
        */

        startOverlay.classList.add(
            "hidden"
        );


        /*
            Actually start game.
        */

        startGame();

    }
);
