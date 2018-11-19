var url = "https://cors-anywhere.herokuapp.com/http://www.boardgamegeek.com/xmlapi/";
var numOfTries = 1;
var boardGames = new Map();

function onDrop(id) {
    var searchingBoardGame = findIn(boardGames, "searching", true, true);
    if(searchingBoardGame) return;

    var boardGame = boardGames.get(id);
    console.log(boardGame);

    var infoBox = document.getElementById("selected-game");
    var row = document.getElementById(`${boardGame.id}`);
    row.cells[0].innerHTML += `<span class="label info">Searching</span>`;
    boardGame.searching = true;
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            var selectedBoardGame = findIn(boardGames, "selected", true, true);
            console.log(selectedBoardGame);
            if(selectedBoardGame) {
                selectedBoardGame.selected = false;
                var selectedRow = document.getElementById(`${selectedBoardGame.id}`);
                selectedRow.style.backgroundColor = "";
            }
            boardGame.selected = true;
            boardGame.searching = false;
            row.cells[0].innerHTML = boardGame.name;
            row.style.backgroundColor = "lightblue";

            document.documentElement.scrollTop = 0;

            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(this.responseText, "text/xml");
            var gameInfo = xmlDoc.getElementsByTagName("boardgame");
            var msg = xmlDoc.getElementsByTagName("message");

            if(gameInfo) {
                var name = boardGame.name;
                var year = boardGame.year;

                //----

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

                infoBox.innerHTML = `<img class="boxImg" src="${image}" />
                    <div class="ratingBox"><p>
                    <strong>Rating:</strong> ${average}<br/>
                    <strong>Difficulty:</strong> ${averageweight}<br/>
                    <strong>User owns:</strong> ${owned}<br/>
                    </p></div>
                    <h2>Name: ${name}</h2>
                    <strong>Published Year:</strong> ${year}<br/><br/>
                    <strong>Minimum Players:</strong> ${minplayers}<br/>
                    <strong>Maximum Players:</strong> ${maxplayers}<br/><br/>
                    <strong>Minimum Playtime:</strong> ${minplaytime}<br/>
                    <strong>Maximum Playtime:</strong> ${maxplaytime}<br/><br/>
                    <strong>Recommended Minimum Age:</strong> ${age}<br/><br/>
                    <strong>Description:</strong> <div class="descBox">${description}</div><br/><br/>
                    <strong>Board Game Publisher(s):</strong><br/><ul>${readyBGPs[0] ? readyBGPs.join("\n"): "<li>(Uncredited)</li>"}</ul><br/>
                    <strong>Board Game Designer(s):</strong><br/><ul>${readyBGDs[0] ? readyBGDs.join("\n"): "<li>(Uncredited)</li>"}</ul><br/>
                    <strong>Board Game Artist(s):</strong><br/><ul>${readyBGAs[0] ? readyBGAs.join("\n"): "<li>(Uncredited)</li>"}</ul><br/>
                `;
            } else if(msg[0]) {
                infoBox.innerHTML = msg[0].childNodes[0].nodeValue;
            } else {
                infoBox.innerHTML = "<label style='display:block;text-align:center'>Something went wrong...</label>";
            }
        }

        if(this.status == 500 || this.status == 504  || this.status == 202) {
            var interval = setInterval(() => {
                xhttp.send();
                if((this.readyState == 4 && this.status == 200) || numOfTries == 4) {
                    result.innerHTML = `The server is not responding... (${numOfTries})`;
                    clearInterval(interval);
                }
                numOfTries++;
            }, 5000);
        }
    }
    xhttp.open("GET", `${url}boardgame/${id}?stats=1`, true)
    xhttp.send();
}

function lastSelected() {
    var selectedBoardGame = findIn(boardGames, "selected", true, true);
    if(!selectedBoardGame) return;
    document.getElementById(`${selectedBoardGame.id}`).scrollIntoView();
}

function gameSearch() {
    numOfTries = 1;
    boardGames = new Map();
    var gSearch = document.getElementById("game-search").value;
    if(!gSearch) {
        document.getElementById("result").innerHTML = "Game search text is missing, please fill it in.";
        return;
    }
    document.getElementById("result").innerHTML = "Searching";
    var result = document.getElementById("result");
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(this.responseText, "text/xml");
            var gamelist = xmlDoc.getElementsByTagName("boardgame");
            var msg = xmlDoc.getElementsByTagName("message");
            if(gamelist[0]) {
                createTable(gamelist, result);
            } else if(msg[0]) {
                result.innerHTML = msg[0].childNodes[0].nodeValue;
            } else {
                result.innerHTML = "There is no such game...";
            }
        }
        if(this.status == 500 || this.status == 504  || this.status == 202) {
            var interval = setInterval(() => {
                xhttp.send();
                if((this.readyState == 4 && this.status == 200) || numOfTries == 4) {
                    result.innerHTML = `The server is not responding... (${numOfTries})`;
                    clearInterval(interval);
                }
                numOfTries++;
            }, 5000);
        }
    }
    xhttp.open("GET", `${url}search?search=${encodeURIComponent(gSearch)}`, true)
    xhttp.send();
}

function userSearch() {
    numOfTries = 1;
    boardGames = new Map();
    var uSearch = document.getElementById("user-search").value;
    var uSelect = document.getElementById("user-select").value;
    var uSelect2 = document.getElementById("user-select2").value;
    if(!uSearch) {
        document.getElementById("result").innerHTML = "User search text is missing, please fill it in.";
        return;
    }
    document.getElementById("result").innerHTML = "Searching";
    var result = document.getElementById("result");
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(this.responseText, "text/xml");
            var gamelist = xmlDoc.getElementsByTagName("item");
            var msg = xmlDoc.getElementsByTagName("message");
            if(gamelist[0]) {
                createTable(gamelist, result);
            } else if(msg[0]) {
                result.innerHTML = msg[0].childNodes[0].nodeValue;
            } else {
                result.innerHTML = "This user is do not have any board game.";
            }
        }
        if(this.status == 500 || this.status == 504 || this.status == 202) {
            var interval = setInterval(() => {
                xhttp.send();
                if((this.readyState == 4 && this.status == 200) || numOfTries == 4) {
                    result.innerHTML = `The server is not responding... (${numOfTries})`;
                    clearInterval(interval);
                }
                numOfTries++;
            }, 5000);
        }
    }

    if(uSelect) xhttp.open("GET", `${url}collection/${encodeURIComponent(uSearch)}?${encodeURIComponent(uSelect)}=${encodeURIComponent(uSelect2)}`, true);
    else xhttp.open("GET", `${url}collection/${encodeURIComponent(uSearch)}`, true);
    xhttp.send();
}

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

function findIn(map, find, value, first) {
    if(first) {
        var key;
        map.forEach((v, k) => {
            if(v[`${find}`] == value) {
                key = k;
                return;
            }
        })
        if(key) return map.get(key);
    } else {
        var keys = [];
        map.forEach((v, k) => {
            if(v[`${find}`] == value) {
                keys.push(k);
            }
        })
        if(keys.length > 0 || keys) return keys;
    }
    return false;
}

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
        tr.onclick = function() {onDrop(this.id)};
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