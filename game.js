/*
    MAPTAP

    Locations are defined below.
*/


const locations = [

    {
        name: "Ben Gurion Airport, Israel",
        lat: 32.0055,
        lon: 34.8854
    },

    {
        name: "Tortuguero, Costa Rica",
        lat: 10.5427,
        lon: -83.5026
    },

    {
        name: "Monteverde, Costa Rica",
        lat: 10.3157,
        lon: -84.8251
    },

    {
        name: "Jacó, Costa Rica",
        lat: 9.6140,
        lon: -84.5370
    },

    {
        name: "Antigua Guatemala",
        lat: 14.5586,
        lon: -90.7295
    },

    {
        name: "Lake Atitlán, Guatemala",
        lat: 14.6907,
        lon: -91.2025
    },

    {
        name: "Tikal, Guatemala",
        lat: 17.2220,
        lon: -89.6237
    },

    {
        name: "Bacalar, Mexico",
        lat: 18.6781,
        lon: -88.3920
    },

    {
        name: "Chichén Itzá, Mexico",
        lat: 20.6843,
        lon: -88.5678
    },

    {
        name: "Holbox, Mexico",
        lat: 21.5236,
        lon: -87.3781
    },

    {
        name: "Washington Monument, Washington DC",
        lat: 38.8895,
        lon: -77.0353
    },

    {
        name: "Liberty Bell, Philadelphia",
        lat: 39.9496,
        lon: -75.1503
    },

    {
        name: "Statue of Liberty, New York",
        lat: 40.6892,
        lon: -74.0445
    },

    {
        name: "Nantucket, Massachusetts",
        lat: 41.2835,
        lon: -70.0995
    },

    {
        name: "Niagara Falls",
        lat: 43.0962,
        lon: -79.0377
    },

    {
        name: "Golden Gate Bridge, San Francisco",
        lat: 37.8199,
        lon: -122.4783
    },

    {
        name: "Disneyland, California",
        lat: 33.8121,
        lon: -117.9190
    },

    {
        name: "The Strip, Las Vegas",
        lat: 36.1147,
        lon: -115.1728
    },

    {
        name: "Grand Canyon, Arizona",
        lat: 36.0544,
        lon: -112.1401
    },

    {
        name: "Salt Lake City, Utah",
        lat: 40.7608,
        lon: -111.8910
    },

    {
        name: "Yellowstone National Park",
        lat: 44.4280,
        lon: -110.5885
    },

    {
        name: "Space Needle, Seattle",
        lat: 47.6205,
        lon: -122.3493
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



/* =========================
   TIMER
========================= */


const ROUND_TIME = 40;

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


const totalRoundsElement =
    document.getElementById(
        "totalRounds"
    );


const timerElement =
    document.getElementById(
        "timer"
    );


const scoreElement =
    document.getElementById(
        "score"
    );


const maxScoreElement =
    document.getElementById(
        "maxScore"
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
    Satellite map without labels.
*/

L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {

        maxZoom: 19,

        attribution:
            "Tiles &copy; Esri"

    }
).addTo(map);



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

    /*
        Maximum score:
        1000 points.

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


    clearInterval(timer);


    timeLeft =
        ROUND_TIME;


    timerElement.textContent =
        timeLeft;


    timer =
        setInterval(
            function () {

                timeLeft--;


                timerElement.textContent =
                    timeLeft;


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
        If there was a guess,
        draw line to answer.
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


    clearInterval(timer);

    timer = null;


    /*
        Use locations in their
        defined order.

        There is NO shuffling.
    */

    gameLocations =
        [...locations];


    currentRound = 0;

    totalScore = 0;


    /*
        Dynamic game information.
    */

    scoreElement.textContent =
        "0";


    totalRoundsElement.textContent =
        gameLocations.length;


    maxScoreElement.textContent =
        gameLocations.length * 1000;


    /*
        Hide final screen.
    */

    finalOverlay.classList.add(
        "hidden"
    );


    /*
        Do not show a location
        before the first round.
    */

    questionElement.textContent =
        "";


    /*
        Start first round.
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
        Check whether all locations
        have been played.
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
        Select the next location.

        Because gameLocations is not
        shuffled, this follows the
        exact order of the array.
    */

    currentLocation =
        gameLocations[
            currentRound
        ];


    currentRound++;


    /*
        Update round display.
    */

    roundElement.textContent =
        currentRound;


    totalRoundsElement.textContent =
        gameLocations.length;


    /*
        Show location name only now.
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
        Start timer.
    */

    startTimer();


    /*
        Start from worldwide view.
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
            Don't allow guessing while
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
            Create guess marker.
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
            Get player's guess.
        */

        const guess =
            guessMarker.getLatLng();


        /*
            Get actual location.
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
            Zoom so both locations
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
            Update result panel.
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
            Show result panel.
        */

        resultOverlay.classList.remove(
            "hidden"
        );


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


    /*
        Make sure the maximum is
        always based on the actual
        number of locations.
    */

    maxScoreElement.textContent =
        gameLocations.length * 1000;


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
    The game does NOT start
    automatically.

    The first location is selected
    only after START GAME is pressed.
*/

startButton.addEventListener(
    "click",
    function () {


        startOverlay.classList.add(
            "hidden"
        );


        startGame();

    }
);
