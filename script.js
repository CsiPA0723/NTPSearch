var url = "https://cors-anywhere.herokuapp.com/http://www.boardgamegeek.com/xmlapi/";

var boardGames = new Map();

function onDrop(id) {
    var boardGame = boardGames.get(id);
    console.log(boardGame);
    var infoBox = document.getElementById("selected-game");
    var row = document.getElementById(`${boardGame.id}`);
    row.cells[0].innerHTML += `<span class="label info">Searching</span>`
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
            row.cells[0].innerHTML = boardGame.name;
            row.style.backgroundColor = "lightblue";

            document.documentElement.scrollTop = 0;

            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(this.responseText, "text/xml");
            var gameInfo = xmlDoc.getElementsByTagName("boardgame");

            if(gameInfo) {
                var name = boardGame.name;
                var year = boardGame.year;

                //----

                var minplayers = gameInfo[0].getElementsByTagName("minplayers")[0];
                if(minplayers) minplayers = minplayers.childNodes[0].nodeValue;
                var maxplayers = gameInfo[0].getElementsByTagName("maxplayers")[0];
                if(maxplayers) maxplayers = maxplayers.childNodes[0].nodeValue;

                //----

                var minplaytime = gameInfo[0].getElementsByTagName("minplaytime")[0];
                if(minplaytime) minplaytime = minplaytime.childNodes[0].nodeValue;
                var maxplaytime = gameInfo[0].getElementsByTagName("maxplaytime")[0];
                if(maxplaytime) maxplaytime = maxplaytime.childNodes[0].nodeValue;

                //----

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

                infoBox.innerHTML = `
                    <strong>Name:</strong> ${name}<img class="boxImg" src="${image}" /><br />
                    <strong>Published Year:</strong> ${year}<br />
                    <strong>Minplayers:</strong> ${minplayers}<br />
                    <strong>Maxplayers:</strong> ${maxplayers}<br />
                    <strong>Minplaytime:</strong> ${minplaytime}<br />
                    <strong>Maxplaytime:</strong> ${maxplaytime}<br />
                    <strong>Age:</strong> ${age}<br /><br />
                    <strong>Description:</strong> <div class="descBox">${description}</div><br /><br />
                    <strong>Boardgamepublishers:</strong><br /><ul>${readyBGPs.join("\n")}</ul><br />
                `;
            }

            var msg = xmlDoc.getElementsByTagName("message");
            if(msg[0]) {
                infoBox.innerHTML = msg[0].childNodes[0].nodeValue;
            }

            /** What is left
             * boardgamedesigner
             * boardgameartist
             * statistics => ratings
             *      average
             *      averageweight
             *      owned
            */
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
            if(gamelist) {
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
            var msg = xmlDoc.getElementsByTagName("message");
            if(msg[0]) {
                result.innerHTML = msg[0].childNodes[0].nodeValue;
            }
        }
    }
    xhttp.open("GET", `${url}search?search=${encodeURIComponent(gSearch)}`, true)
    xhttp.send();
}

function userSearch() {
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
            if(gamelist) {
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
            var msg = xmlDoc.getElementsByTagName("message");
            if(msg[0]) {
                result.innerHTML = msg[0].childNodes[0].nodeValue;
            }
            /**
             * if respons is empty notify the user
             * if respons is onnhold try again and do this in the board game search too
             */
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
        selected: false
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