$(document).ready(function () {
    $('.sidenav').sidenav();
    $.get("/scrape");
    $(".modal").modal();
});

$(document).on("click", ".scrape", function (event) {
    event.preventDefault();

    $.get("/scrape");
});

$(document).on("click", ".save", function (event) {
    event.preventDefault();

    var clicked = $(this);
    var id = clicked.attr("data-id");
    var saved = clicked.attr("data-saved");

    if (saved == "true") {
        $.get("/save/" + id + "/" + saved, function(data){
            clicked.attr("data-saved", "false");
            clicked.find("i").text("cloud");
        });
    } else {
        $.get("/save/" + id + "/" + saved, function(data){
            clicked.attr("data-saved", "true");
            clicked.find("i").text("cloud_done");
        });
    }
});

$(document).on("click", "#saved-articles", function (event) {
    event.preventDefault();

    $.get("/saved");
});

$(document).on("click", ".modal-open", function (event){
    event.preventDefault();

    var modalDataID = $(this).data("id");
    $("#comment-form").attr("data-id", modalDataID);
})

$(document).on("submit", "form", function(event){
    event.preventDefault();
    
    var id = $(this).attr("data-id");
    var comment = $("#comment").val().trim();
    
    $.post("/comment", {id: id, comment: comment});
});

$(document).on("click", ".del-comment", function(event){
    event.preventDefault();
    
    var comLong = $(this).parent().text().trim();
    var com = comLong.slice(0, (comLong.length - 5)).trim();
    var id = $(this).attr("data-id");
    
    $.post("/delcom", {id: id, comment: com});
});