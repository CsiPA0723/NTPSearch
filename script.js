var url = "https://cors-anywhere.herokuapp.com/http://www.boardgamegeek.com/xmlapi/";

var boardGames = new Map();

function onDrop(id) {
    var boardGame = boardGames.get(id);
    console.log(boardGame);
    var row = document.getElementById(id);
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(this.responseText, "text/xml");
            var gameInfo = xmlDoc.getElementsByTagName("boardgame");
            if(gameInfo) {
                var tbl = document.createElement('table');
                tbl.id = "table";
                var tbdy = document.createElement('tbody');
                for(let i = 0; i < gameInfo.length; i++) {
                    var id = gameInfo[i].getAttribute("objectid");
                    var name = gameInfo[i].getElementsByTagName("name")[0].childNodes[0].nodeValue;
                    var year = "undefined";
                    if(gameInfo[i].getElementsByTagName("yearpublished")[0]) {
                        year = gameInfo[i].getElementsByTagName("yearpublished")[0].childNodes[0].nodeValue;
                    }
    
                    var tr = document.createElement('tr');
                    tr.id = i;
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
                row.appendChild(tbl) 
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

function gameSearch() {
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
                for(let i = 0; i < gamelist.length; i++) {
                    var id = gamelist[i].getAttribute("objectid");
                    var name = gamelist[i].getElementsByTagName("name")[0].childNodes[0].nodeValue;
                    var year = "undefined";
                    if(gamelist[i].getElementsByTagName("yearpublished")[0]) {
                        year = gamelist[i].getElementsByTagName("yearpublished")[0].childNodes[0].nodeValue;
                    }
    
                    var tr = document.createElement('tr');
                    tr.id = i;
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
            result.innerHTML = this.responseText;
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
        year: year
    }
    return obj;
}

/*function tableCreate() {
    let whOrBl = false;
    var body = document.getElementById("chessTable");
    var tbl = document.createElement('table');
    tbl.id = "table";
    var tbdy = document.createElement('tbody');
    for (let i = 0; i < HEIGTH; i++) {
        var tr = document.createElement('tr');
        for (let j = 0; j < WIDTH; j++) {
            var td = document.createElement('td');
            if(DEBUG) td.innerHTML = `${j} ${i}`;
            if(DEBUG) td.style.color = "rgb(100, 200, 200)";
            td.style.backgroundColor = `${whOrBl ? lightbrown: brown}`;
            td.id = `td(${j}_${i})`;
            td.style.backgroundSize = "100%";
            td.style.backgroundRepeat = "no-repeat";
            td.onclick = function() {onClick(this.id)};
            if(i == 0 || i == HEIGTH - 1) {
                if(i == 0){
                    td.style.backgroundImage = `url("./BlackCMs/black_${figureOrder[j].name}.png")`;
                } else {
                    td.style.backgroundImage = `url("./WhiteCMs/white_${figureOrder[j].name}.png")`;
                }
                figures.set(td.id, createFigureObj(td.id, figureOrder[j].name, i == 0 ? "black" : "white", j, i, figureOrder[j].point, td.style.backgroundImage));
            } else if (i == 1 || i == HEIGTH - 2) {
                if(i == 1) {
                    td.style.backgroundImage = `url("./BlackCMs/black_pawn.png")`;
                } else {
                    td.style.backgroundImage = `url("./WhiteCMs/white_pawn.png")`;
                }
                figures.set(td.id, createFigureObj(td.id, "pawn", i == 1 ? "black" : "white", j, i, 1, td.style.backgroundImage));
            }
            tiles.set(td.id, createTileObj(td.id, figures.get(td.id) || null, td.style.backgroundColor));
            tr.appendChild(td);
            whOrBl = !whOrBl;
        }
        whOrBl = !whOrBl;
        tbdy.appendChild(tr);
    }
    tbl.appendChild(tbdy);
    body.appendChild(tbl);
}*/ 