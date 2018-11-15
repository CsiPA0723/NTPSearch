function init() {

}

function gameSearch() {
    var gSearch = document.getElementById("user-search").value;
    var result = document.getElementById("result");
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if(this.readyState == 4) {
            if(this.status == 200) {
                result.innerHTML = this.responseText;
            }
            document.getElementById("demo").innerHTML = "...";
        }
    }
    xhttp.
    xhttp.open("GET", "http://www.boardgamegeek.com/xmlapi/search?search="+encodeURI(gSearch), true)
    xhttp.send();
}

function userSearch() {
    var uSearch = document.getElementById("user-search").value;
    var uSelect = document.getElementById("user-select").value;
    var uSelect2 = document.getElementById("user-select2").value;
    var result = document.getElementById("result");


}