/*
    MAPTAP

    Locations are defined below.
*/


/* =========================
   GAME STATE
========================= */


let selectedGame = null;

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

const gameList =
    document.getElementById(
        "gameList"
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


function showGameSelection() {

    gameList.innerHTML = "";


    games.forEach(
        function (
            game,
            index
        ) {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "game-option";


            button.innerHTML =
                `
                <span>
                    ${game.name}
                </span>

                <small>
                    ${game.locations.length}
                    locations
                </small>
                `;


            button.addEventListener(
                "click",
                function () {


                    /*
                        Remove selection from
                        all game buttons.
                    */

                    document
                        .querySelectorAll(
                            ".game-option"
                        )
                        .forEach(
                            function (
                                option
                            ) {

                                option.classList.remove(
                                    "selected"
                                );

                            }
                        );


                    /*
                        Select this game.
                    */

                    button.classList.add(
                        "selected"
                    );


                    selectedGame =
                        games[index];


                    /*
                        Enable Start Game.
                    */

                    startButton.disabled =
                        false;

                }
            );


            gameList.appendChild(
                button
            );

        }
    );

}

function startGame() {


    clearInterval(timer);

    timer = null;


    /*
        Use locations in their
        defined order.

        There is NO shuffling.
    */

    gameLocations =
    [...selectedGame.locations];


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

        if (!selectedGame) {

            return;

        }


        startOverlay.classList.add(
            "hidden"
        );


        startGame();

    }
);

showGameSelection();