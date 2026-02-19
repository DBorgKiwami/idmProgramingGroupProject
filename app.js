var http = require("http");

const PORT = 3000;
const express = require("express");
const path = require("path");
const app = express();
const movieData = [
    { title:"toy story", starring:"men" },
    { title:"hiking", starring:"wait this isn't a movie" },
    { title:"IM A DEAD MAN", starring:"IM A DEAD MAN" }
];
const homepagedata = [
    { postid:1, postbody:"lorem ipsum", game:"Mewgenics"},
    { postid:2, postbody:"lorem ipsum", game:"Romeo is a Dead Man"},
    { postid:3, postbody:"lorem ipsum", game:"Space Warlord Baby Trading Simulator"},
    { postid:4, postbody:"lorem ipsum", game:"Space Warlord Organ Trading Simulator"},
    { postid:5, postbody:"lorem ipsum", game:"The Binding of Isaac"},
    { postid:5, postbody:"lorem ipsum", game:"The Binding of Isaac"},
    { postid:5, postbody:"lorem ipsum", game:"The Binding of Isaac"},
    { postid:5, postbody:"lorem ipsum", game:"The Binding of Isaac"},
    { postid:5, postbody:"lorem ipsum", game:"The Binding of Isaac"},
    { postid:5, postbody:"lorem ipsum", game:"The Binding of Isaac"},
    { postid:5, postbody:"lorem ipsum", game:"The Binding of Isaac"}
]
app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"./views"));

app.get("/", (request, response) => {
    response.write("eerghkgerjaghlkejghsdflzuigsdf;iughsd;iufgh");
    response.end();
})

app.get("/homepage", (request,response) => {
    return response.render(
        "homepage",
        {
            popularPosts : homepagedata, //Popular
            usersPosts : homepagedata //Your Posts
        }
    );
});

app.get("/movies", (request,response) => {
    var id = 0;
    return response.render(
        "movies",
        { data: { title:"Movies" },
          movie: movieData[id]
        }
    );
});

//?id=5&name=Daniel request.query.id
app.get("/movies/:id", (request,response) => {
    var id = request.params.id;
    if(id < 3){
        return response.render(
            "movies",
            { data: { title:"Movies" },
            movie: movieData[id]
            }
        );
    }
    else{
        return response.render(
            "movies",
            { data: { title:"Movies" },
            movie: movieData[0]
            }
        );
    }
});

app.listen(PORT);

console.log(`Server running on http://localhost:${PORT}`);