var url = "https://cors-anywhere.herokuapp.com/http://www.boardgamegeek.com/xmlapi/";

function init() {

}

function gameSearch() {

    var gSearch = document.getElementById("game-search").value;
    var result = document.getElementById("result");
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            var newtext = "";
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(this.responseText,"text/xml");
            var gamelist=xmlDoc.getElementsByTagName("boardgame");
            newtext+="FELDOLGOZOTT:\n\n";
            for (i = 0; i< gamelist.length; i++) {
                newtext+="Index: "+i+"\n";
                newtext+="  Objektum azonosító: "+gamelist[i].getAttribute("objectid")+"\n";
                newtext+="  Játék neve: "+gamelist[i].getElementsByTagName("name")[0].childNodes[0].nodeValue+"\n";
                newtext+="  Megjelenés éve: "+gamelist[i].getElementsByTagName("yearpublished")[0].childNodes[0].nodeValue+"\n";
                newtext+="\n";
            }
            result.innerHTML = newtext;
        }
    }
    xhttp.open("GET", `${url}search?search=${encodeURIComponent(gSearch)}`, true)
    xhttp.setRequestHeader('Term', 'Accept');
    xhttp.send();
}

function userSearch() {
    var uSearch = document.getElementById("user-search").value;
    var uSelect = document.getElementById("user-select").value;
    var uSelect2 = document.getElementById("user-select2").value;
    var result = document.getElementById("result");

}