$(document).ready(function () {
    $('.sidenav').sidenav();
    $.get("/scrape", function(data){
        displayhtml(data);
    });
});

function displayhtml(data) {
    $("#articles").html("");

    data.forEach(function (element) {
        var newArticle = $("<div>");
        $(newArticle).addClass("col s12 m6 xl4")

        var articleCard = $("<div>");
        $(articleCard).addClass("card large teal");

        var articleImg = $("<div>");
        $(articleImg).addClass("card-image");
        $(articleImg).append("<img src='" + element.img + "'>");
        $(articleImg).append("<a class='btn-floating halfway-fab waves-effect modal-trigger waves-light red open-modal' href='#modal' data-id='" + element._id + "'><i class='large material-icons'>mode_edit</i></a>");
        $(articleCard).append(articleImg);

        var cardContent = $("<div>");
        $(cardContent).addClass("card-content center");
        $(cardContent).append("<h5>" + element.title + "</h5>");
        $(cardContent).append("<h6>" + element.byline + "</h6>");
        $(cardContent).append("<p>" + element.time + "</p>");
        $(articleCard).append(cardContent);

        var cardAction = $("<div>");
        $(cardAction).addClass("card-action center");
        $(cardAction).append("<a href='" + element.link + "'><i class='material-icons'>subject</i></a>");
        $(cardAction).append()

        if (element.saved == false) {
            $(cardAction).append("<a class='save' data-id='" + element._id + "' data-saved='" + element.saved + "' href='/'><i class='material-icons'>cloud</i></a>");
        } else {
            $(cardAction).append("<a class='save' data-id='" + element._id + "' data-saved='" + element.saved + "' href='/'><i class='material-icons'>cloud_done</i></a>");
        }

        $(cardAction).append("<a class='comment card-title activator' data-id='" + element._id + "'><i class='material-icons'>comment</i></a>");

        var cardReveal = $("<div>");
        $(cardReveal).addClass("card-reveal");
        $(cardReveal).append("<span class='card-title grey-text text-darken-4'>Comments<i class='material-icons right'>close</i></span>");

        element.comments.forEach(function (comment) {
            var commentDiv = $("<div>");
            $(commentDiv).append("<p class='card-com black-text'>" + comment + "<button class='btn right waves-effect waves-light red del-comment' data-id='" + element._id + "'><i class='material-icons'>close</i></button></p>")
            $(cardReveal).append(commentDiv);
        });

        $(articleCard).append(cardAction);

        $(articleCard).append(cardReveal);

        $(newArticle).append(articleCard);

       $("#articles").append(newArticle);
       
    });

    var modal = $("<div>");
    $(modal).attr("id", "modal");
    $(modal).addClass("modal");

    var modalContent = $("<div>");
    $(modalContent).append("<form id='comment-modal'>" +
        "<div class='input-field col s12'><textarea id='comment' class='materialize-textarea'></textarea>" +
        "<label for='comment'>Type Comment Here</label></div>" +
        "<button type='submit' class='waves-effect waves-light modal-close btn add-comment' name='action'>Comment</button>" +
        "</form>");

    $(modal).append(modalContent);

    var modalFooter = $("<div>");
    $(modalFooter).addClass("modal-footer")
    $(modalFooter).append("<a class='modal-action modal-close waves-effect waves-green btn-flat'>Close</a>");

    $(modal).append(modalFooter);
    $("#articles").append(modal);
    $('.modal').modal();
}

$(document).on("click", ".scrape", function (event) {
    event.preventDefault();

    $.get("/scrape", function (data) {
        displayhtml(data);
    });
});

$(document).on("click", ".save", function (event) {
    event.preventDefault();

    var clicked = $(this);
    var id = clicked.attr("data-id");
    var saved = clicked.attr("data-saved");

    if (saved === "true") {
        $.get("/save/" + id + "/" + saved, function (data) {
            
            clicked.find("i").text("cloud");
            clicked.attr("data-saved", data.saved);
        });
    } else {
        $.get("/save/" + id + "/" + saved, function (data) {
            clicked.find("i").text("cloud_done");
            clicked.attr("data-saved", data.saved);
        });
    }
});

$(document).on("click", ".open-modal", function (event) {
    event.preventDefault();

    var clicked = $(this);
    var formID = clicked.attr("data-id");
    $("#comment-modal").attr("data-id", formID);
});


$(document).on("click", "#saved-articles", function (event) {
    event.preventDefault();

    $.get("/saved", function (data) {
        displayhtml(data);
    });
});

$(document).on("submit", "#comment-modal", function(event){
    event.preventDefault();
    
    var id = $(this).attr("data-id");
    var comment = $("#comment").val();
    
    $.post("/comment", {id: id, comment: comment}, function(data){
        displayhtml(data);
    });
});

$(document).on("click", ".del-comment", function(event){
    event.preventDefault();
    
    var comLong = $(this).parent().text();
    var com = comLong.slice(0, (comLong.length - 5));
    var id = $(this).attr("data-id");

    $.post("/delcom", {id: id, comment: com}, function(data){
        displayhtml(data);
    });
});