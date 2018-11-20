const url = "https://cors-anywhere.herokuapp.com/http://www.boardgamegeek.com/xmlapi/"; //A fő url-ünk
var numOfTries = 0; //Probálkozások száma
var boardGames = new Map(); //A társasjáték object-umok map-ja
window.onscroll = function() {scrollFunction()};

//A játék információkat kéri le és irja ki.

function getGameInfo(id) {
    numOfTries = 0;
    //Megkeressük azt a játékot amit éppen keresünk, ha van akkor ignoráljuk a kérést, mert akkor az előző elveszne
    var searchingBoardGame = findIn(boardGames, "searching", true, true);
    if(searchingBoardGame) return;

    console.log("getGameInfo");

    var boardGame = boardGames.get(id);
    console.log("BoardGame: " + boardGame);

    var infoBox = document.getElementById("selected-game");
    var row = document.getElementById(`${boardGame.id}`);
    row.cells[0].innerHTML += `<span class="label info">Searching</span>`;
    boardGame.searching = true;
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        console.log("ReadyState: " + this.readyState);
        console.log("Status: " + this.status);
        if(this.readyState = 4 && this.status == 202) {
            //Ha 202 kódot kap akkor 5 mp után elküldi újra a kérelmet egsézen addig
            //amíg vagy jó nem lesz vagy 4-szer nem csinálja ezt meg
            numOfTries++;
            if(numOfTries > 4) {
                infoBox.innerHTML = "<label class='waitLabel'>The server is not ready. Please try again later.</label>";
                numOfTries = 0;
                console.log("Abort");
                this.abort();
            }
            console.log("Abort");
            this.abort();
            infoBox.innerHTML = `<label class='waitLabel'>The server is not responding correctly, please stand by. (${numOfTries})</label>`;
            infoBox.scrollIntoView();
            setTimeout(() => {
                xhttp.open("GET", `${url}boardgame/${id}?stats=1`, true)
                xhttp.send();
            }, 5000);
        }
        if(this.readyState == 4 && this.status == 200) {
            //Ha normális választ kap
            infoBox.innerHTML = "<label class='waitLabel'>Something went wrong...</label>"; //Ha a gameInfo és msg is üres akkor nem talált semmit
            //Megkeressük a már kiválaszott játékot és vissza rakjuk normálba
            //A jenlegit meg kiválasztjuk
            var selectedBoardGame = findIn(boardGames, "selected", true, true);
            console.log("SelectedBoardGame: " + selectedBoardGame);
            if(selectedBoardGame) {
                selectedBoardGame.selected = false;
                var selectedRow = document.getElementById(`${selectedBoardGame.id}`);
                selectedRow.style.backgroundColor = "";
            }
            boardGame.selected = true;
            boardGame.searching = false;
            row.cells[0].innerHTML = boardGame.name;
            row.style.backgroundColor = "lightblue";

            document.documentElement.scrollTop = 0; //Főlgörgetünk a lap tetejére

            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(this.responseText, "text/xml");
            var gameInfo = xmlDoc.getElementsByTagName("boardgame");
            var msg = xmlDoc.getElementsByTagName("message");

            if(gameInfo[0]) {
                //Előkészítjük az információkat és le is teszteljük, hogy meg lettek-e adva a lekérdezés által
                //Így elkerülve az "undefined" error-t

                var minplayers = gameInfo[0].getElementsByTagName("minplayers")[0];
                if(minplayers) minplayers = minplayers.childNodes[0].nodeValue;
                var maxplayers = gameInfo[0].getElementsByTagName("maxplayers")[0];
                if(maxplayers) maxplayers = maxplayers.childNodes[0].nodeValue;

                var minplaytime = gameInfo[0].getElementsByTagName("minplaytime")[0];
                if(minplaytime) minplaytime = minplaytime.childNodes[0].nodeValue;
                var maxplaytime = gameInfo[0].getElementsByTagName("maxplaytime")[0];
                if(maxplaytime) maxplaytime = maxplaytime.childNodes[0].nodeValue;

                var age = gameInfo[0].getElementsByTagName("age")[0];
                if(age) age = age.childNodes[0].nodeValue;
                var description = gameInfo[0].getElementsByTagName("description")[0];
                if(description) description = description.childNodes[0].nodeValue;
                var image = gameInfo[0].getElementsByTagName("image")[0];
                if(image) image = image.childNodes[0].nodeValue;

                //Előkészítjük a listázásra ezeket az elemeket, mert belőlük több is lehet

                var boardgamepublishers = gameInfo[0].getElementsByTagName("boardgamepublisher");
                var readyBGPs = [];
                if(boardgamepublishers[0]) {
                    for(let i = 0; i < boardgamepublishers.length; i++) {
                        if(boardgamepublishers[i]) {
                            readyBGPs.push("<li>"+ boardgamepublishers[i].childNodes[0].nodeValue + "</li>");
                        }
                    }
                }

                var boardgamedesigners = gameInfo[0].getElementsByTagName("boardgamedesigner");
                var readyBGDs = [];
                if(boardgamedesigners[0]) {
                    for(let i = 0; i < boardgamedesigners.length; i++) {
                        if(boardgamedesigners[i]) {
                            readyBGDs.push("<li>"+ boardgamedesigners[i].childNodes[0].nodeValue + "</li>");
                        }
                    }
                }

                var boardgameartists = gameInfo[0].getElementsByTagName("boardgameartist");
                var readyBGAs = [];
                if(boardgameartists[0]) {
                    for(let i = 0; i < boardgameartists.length; i++) {
                        if(boardgameartists[i]) {
                            readyBGAs.push("<li>"+ boardgameartists[i].childNodes[0].nodeValue + "</li>");
                        }
                    }
                }

                var statistics = gameInfo[0].getElementsByTagName("statistics");
                var ratings = null;
                if(statistics[0]) {
                    ratings = statistics[0].getElementsByTagName("ratings");
                }
                var average = 0;
                var averageweight = 0;
                var owned = 0;

                if(ratings[0]) {
                    average = ratings[0].getElementsByTagName("average")[0].childNodes[0].nodeValue;
                    averageweight = ratings[0].getElementsByTagName("averageweight")[0].childNodes[0].nodeValue;
                    owned = ratings[0].getElementsByTagName("owned")[0].childNodes[0].nodeValue;
                }

                infoBox.innerHTML =
                    `<strong>Average Rating:</strong><div id="rateBar"><div id="rating"></div></div><br/>
                    <img class="boxImg" src="${image}" alt="${!image ? "Not available." : "This game has a picture but something went wrong."}" />
                    <div class="ratingBox"><p><strong>Difficulty:</strong> ${roundNumber(averageweight, 1)} / 5<br/>
                    <strong>User owns:</strong> ${owned}</p></div>
                    <h2>Name: ${boardGame.name}</h2>
                    <strong>Published Year:</strong> ${boardGame.year}<br/><br/>
                    <strong>Minimum Players:</strong> ${minplayers}<br/>
                    <strong>Maximum Players:</strong> ${maxplayers}<br/><br/>
                    <strong>Minimum Playtime:</strong> ${minplaytime}<br/>
                    <strong>Maximum Playtime:</strong> ${maxplaytime}<br/><br/>
                    <strong>Recommended Minimum Age:</strong> ${age}<br/><br/>
                    <strong>Description:</strong> <div class="descBox">${description}</div><br/><br/>
                    <strong>Board Game Publisher(s):</strong><br/><ul>${readyBGPs[0] ? readyBGPs.join("\n") : "<li>(Uncredited)</li>"}</ul>
                    <strong>Board Game Designer(s):</strong><br/><ul>${readyBGDs[0] ? readyBGDs.join("\n") : "<li>(Uncredited)</li>"}</ul>
                    <strong>Board Game Artist(s):</strong><br/><ul>${readyBGAs[0] ? readyBGAs.join("\n") : "<li>(Uncredited)</li>"}</ul>`;


                //A rating-hez megcsináljuk a százalékot

                var ratingNum = roundNumber(average * 10, 1);
                var rating = document.getElementById("rating");
                rating.style.width = ratingNum + "%";
                rating.innerHTML = ratingNum + "%";
            } else if(msg[0]) {
                //Ha esetleg mást adna vissza és az egy üzenet lenne a szervertől akkor kiírjuk azt
                infoBox.innerHTML = msg[0].childNodes[0].nodeValue;
            }
            console.log("Abort");
            numOfTries = 0;
            this.abort();
        }
    }
    xhttp.open("GET", `${url}boardgame/${id}?stats=1`, true)
    xhttp.send();
}

//Az utolsó kiválaszott lista elemhez dob vissza.

function lastSelected() {
    var selectedBoardGame = findIn(boardGames, "selected", true, true);
    if(!selectedBoardGame) return;
    document.getElementById(`${selectedBoardGame.id}`).scrollIntoView();
}

//A társasjátékokat kéri le és iratja ki azokat. 

function gameSearch() {
    console.log("gameSearch");
    numOfTries = 0;
    boardGames = new Map(); //Minden egyess kérelemnél úrja kreáljuk, így elkerűlve a keveredést és a fölösleges adatot
    var gSearch = document.getElementById("game-search").value;
    //Ha nem ír be semmit a felhsználó fölöslegesen nem küldünk el kérelmet
    //és kérjuk, hogy töltse ki
    if(!gSearch) {
        document.getElementById("result").innerHTML = "Game search text is missing, please fill it in.";
        return;
    }
    document.getElementById("result").innerHTML = "Searching";
    var result = document.getElementById("result");
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        console.log("ReadyState: " + this.readyState);
        console.log("Status: " + this.status);
        if(this.readyState = 4 && this.status == 202) {
            //Ha 202 kódot kap akkor 5 mp után elküldi újra a kérelmet egsézen addig
            //amíg vagy jó nem lesz vagy 4-szer nem csinálja ezt meg
            numOfTries++;
            if(numOfTries > 4) {
                result.innerHTML = "The server is not ready. Please try again later.";
                numOfTries = 0;
                console.log("Abort");
                this.abort();
            }
            console.log("Abort");
            this.abort();
            result.innerHTML = `The server is not responding correctly, please stand by. (${numOfTries})`;
            result.scrollIntoView();
            setTimeout(() => {
                xhttp.open("GET", `${url}search?search=${encodeURIComponent(gSearch)}`, true)
                xhttp.send();
            }, 5000);
        }
        if(this.readyState == 4 && this.status == 200) {
            //Ha normális választ kap
            result.innerHTML = "There is no such board game..."; //Ha a gamelist és msg is üres akkor nem talált semmit
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(this.responseText, "text/xml");
            var gamelist = xmlDoc.getElementsByTagName("boardgame");
            var msg = xmlDoc.getElementsByTagName("message");
            if(gamelist[0]) {
                createTable(gamelist, result);
            } else if(msg[0]) {
                //Ha esetleg mást adna vissza és az egy üzenet lenne a szervertől akkor kiírjuk azt
                result.innerHTML = msg[0].childNodes[0].nodeValue;
            }
            result.scrollIntoView();
            console.log("Abort");
            numOfTries = 0;
            this.abort();
        }
    }
    xhttp.open("GET", `${url}search?search=${encodeURIComponent(gSearch)}`, true)
    xhttp.send();
}

//A felhasználok játékait kéri le és irja ki azokat.

function userSearch() {
    console.log("userSearch");
    numOfTries = 0;
    boardGames = new Map(); //Minden egyess kérelemnél úrja kreáljuk, így elkerűlve a keveredést és a fölösleges adatot
    var uSearch = document.getElementById("user-search").value;
    var uSelect = document.getElementById("user-select").value;
    var uSelect2 = document.getElementById("user-select2").value;
    //Ha nem ír be semmit a felhsználó fölöslegesen nem küldünk el kérelmet
    //és kérjuk, hogy töltse ki
    if(!uSearch) {
        document.getElementById("result").innerHTML = "User search text is missing, please fill it in.";
        return;
    }
    document.getElementById("result").innerHTML = "Searching";
    var result = document.getElementById("result");
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        console.log("ReadyState: " + this.readyState);
        console.log("Status: " + this.status);
        if(this.readyState = 4 && this.status == 202) {
            numOfTries++;
            if(numOfTries > 4) {
                result.innerHTML = "The server is not ready. Please try again later.";
                numOfTries = 0;
                console.log("Abort");
                this.abort();
            }
            console.log("Abort");
            this.abort();
            result.innerHTML = `The server is not responding correctly, please stand by. (${numOfTries})`;
            result.scrollIntoView();
            setTimeout(() => {
                if(uSelect) xhttp.open("GET", `${url}collection/${encodeURIComponent(uSearch)}?${encodeURIComponent(uSelect)}=${encodeURIComponent(uSelect2)}`, true);
                else xhttp.open("GET", `${url}collection/${encodeURIComponent(uSearch)}`, true);
                xhttp.send();
            }, 5000);
        }
        if(this.readyState == 4 && this.status == 200) {
            result.innerHTML = "Could not find anything..."; //Ha a gamelist és msg is üres akkor nem talált semmit
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(this.responseText, "text/xml");
            var gamelist = xmlDoc.getElementsByTagName("item");
            var msg = xmlDoc.getElementsByTagName("message");
            if(gamelist[0]) {
                createTable(gamelist, result);
            } else if(msg[0]) {
                //Ha esetleg mást adna vissza és az egy üzenet lenne a szervertől akkor kiírjuk azt
                result.innerHTML = msg[0].childNodes[0].nodeValue;
            }
            result.scrollIntoView();
            console.log("Abort");
            numOfTries = 0;
            this.abort();
        }
    }

    if(uSelect) xhttp.open("GET", `${url}collection/${encodeURIComponent(uSearch)}?${encodeURIComponent(uSelect)}=${encodeURIComponent(uSelect2)}`, true);
    else xhttp.open("GET", `${url}collection/${encodeURIComponent(uSearch)}`, true);
    xhttp.send();
}

//A társasjáték objektum shéma

function createBoardGameObject(id, name, year) {
    var obj = {
        id: id,
        name: name,
        year: year,
        selected: false,
        searching: false
    }
    return obj;
}

//Keresési algoritmus egy map-ban, érték alapján

function findIn(map, find, value, first) {
    if(first) {
        var key;
        map.forEach((v, k) => {
            //Egészen addig megyünk amíg meg nem találjuk az első értéket ami megfelel a feltételnek
            if(v[`${find}`] == value) {
                key = k;
                return;
            }
        })
        if(key) return map.get(key);
    } else {
        var keys = [];
        map.forEach((v, k) => {
            //Minden értéket vissza adunk ami megfelel a feltételnek
            if(v[`${find}`] == value) {
                keys.push(k);
            }
        })
        if(keys.length > 0 || keys) return keys;
    }
    return false; //Ha nem találtunk semmit akkor vissza küldünk egy hamisat, így lehet használni feltételeknél is
}

//Szám kerekités

function roundNumber(num, scale) {
    if(!("" + num).includes("e")) {
        return +(Math.round(num + "e+" + scale)  + "e-" + scale);
    } else {
        var arr = ("" + num).split("e");
        var sig = ""
        if(+arr[1] + scale > 0) {
            sig = "+";
        }
        return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
    }
}

//Tábla kreálás a listához

function createTable(gamelist, result) {
    var tbl = document.createElement('table');
    tbl.id = "table";
    var tbdy = document.createElement('tbody');
    var tr = document.createElement('tr');
    var th = document.createElement('th');
    th.innerHTML = "Name";
    tr.appendChild(th);
    th = document.createElement('th');
    th.innerHTML = "Year";
    tr.appendChild(th);
    tbdy.append(tr);
    for(let i = 0; i < gamelist.length; i++) {
        var id = gamelist[i].getAttribute("objectid");
        var name = gamelist[i].getElementsByTagName("name")[0].childNodes[0].nodeValue;
        var year = "undefined";
        if(gamelist[i].getElementsByTagName("yearpublished")[0]) {
            year = gamelist[i].getElementsByTagName("yearpublished")[0].childNodes[0].nodeValue;
        }

        tr = document.createElement('tr');
        tr.id = id;
        tr.onclick = function() {getGameInfo(this.id)};
        for(let j = 0; j < 2; j++) {
            var td = document.createElement('td');
            td.innerHTML = j == 0 ? name : year;
            tr.appendChild(td);
        }
        var boardGame = createBoardGameObject(id, name, year);
        boardGames.set(id, boardGame);
        tbdy.appendChild(tr);
    }
    tbl.appendChild(tbdy);
    result.innerHTML = "";
    result.appendChild(tbl);
}

//Görgető funkció a toTop gombhoz

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        document.getElementById("myBtn").style.display = "block";
    } else {
        document.getElementById("myBtn").style.display = "none";
    }
}

//Mikor a felhasználó rá káttaint a gombra, fölgörget az oldal tetejére.
function topFunction() {
    document.documentElement.scrollTop = 0;
}