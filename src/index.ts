import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { AddressInfo } from "net";

import { signUpEndpoint } from "./endpoints/signUp";
import { loginEndpoint } from "./endpoints/login";
import { getUserProfileEndpoint } from "./endpoints/getUserProfile";
import { getUserEndpoint } from "./endpoints/getUser";
import { createRecipeEndpoint } from "./endpoints/createRecipe";
import { getRecipeEndpoint } from "./endpoints/getRecipe";
import { followUserEndpoint } from "./endpoints/followUser";
import { unfollowUserEndpoint } from "./endpoints/unfollowUser";
import { getFeedEndpoint } from "./endpoints/getFeed";

dotenv.config();

const app = express();

app.use(express.json());

/* paths dos endpoints */
app.post("/signup", signUpEndpoint);
app.post("/login", loginEndpoint);
app.get("/user/profile", getUserProfileEndpoint);
app.get("/user/:id", getUserEndpoint);
app.post("/recipe", createRecipeEndpoint);
app.get("/recipe/:id", getRecipeEndpoint);
app.post("/user/follow", followUserEndpoint);
app.post("/user/unfollow", unfollowUserEndpoint);
app.get("/feed", getFeedEndpoint);

/* Configurações do express para iniciar o servidor */
const server = app.listen(process.env.PORT || 3003, () => {
    if (server) {
        const address = server.address() as AddressInfo;
        console.log(`Server is running in http://localhost:${address.port}`);
    }
    else {
        console.error(`Failure upon starting server.`);
    }
});
