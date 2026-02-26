var http = require("http");

const PORT = 3000;
const express = require("express");
const path = require("path");
const fs = require("fs");
const methodOverride = require("method-override");
const app = express();

const POSTS_FILE = path.join(__dirname, "data", "posts.json");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const movieData = [
    { title:"toy story", starring:"men" },
    { title:"hiking", starring:"wait this isn't a movie" },
    { title:"IM A DEAD MAN", starring:"IM A DEAD MAN" }
];

app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"./views"));

// Helper functions for reading/writing posts
function readPosts() {
    const data = fs.readFileSync(POSTS_FILE, "utf-8");
    return JSON.parse(data);
}

function writePosts(posts) {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
}

app.get("/", (request, response) => {
    response.write("eerghkgerjaghlkejghsdflzuigsdf;iughsd;iufgh");
    response.end();
})

// Homepage - list all posts
app.get("/homepage", (request,response) => {
    const posts = readPosts();
    return response.render(
        "homepage",
        {
            popularPosts : posts,
            usersPosts : posts
        }
    );
});

// Show create post form
app.get("/posts/new", (request, response) => {
    response.render("posts/new");
});

// Create a new post
app.post("/posts", (request, response) => {
    const posts = readPosts();
    const newId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;
    const newPost = {
        id: newId,
        postbody: request.body.postbody,
        game: request.body.game
    };
    posts.push(newPost);
    writePosts(posts);
    response.redirect("/homepage");
});

// Show edit post form
app.get("/posts/:id/edit", (request, response) => {
    const posts = readPosts();
    const post = posts.find(p => p.id === parseInt(request.params.id));
    if (!post) {
        return response.status(404).send("Post not found");
    }
    response.render("posts/edit", { post });
});

// Update a post
app.put("/posts/:id", (request, response) => {
    const posts = readPosts();
    const post = posts.find(p => p.id === parseInt(request.params.id));
    if (!post) {
        return response.status(404).send("Post not found");
    }
    post.postbody = request.body.postbody;
    post.game = request.body.game;
    writePosts(posts);
    response.redirect("/homepage");
});

// Delete a post
app.delete("/posts/:id", (request, response) => {
    let posts = readPosts();
    posts = posts.filter(p => p.id !== parseInt(request.params.id));
    writePosts(posts);
    response.redirect("/homepage");
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
