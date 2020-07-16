import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { AddressInfo } from "net";
import { IdGenerator } from "./services/IdGenerator";
import { UserDatabase } from "./data/UserDatabase";
import { Authenticator } from "./services/Authenticator";
import HashManager from "./services/HashManager";
import moment from 'moment';
import { RecipeDatabase } from "./data/RecipeDatabase";

/*Atribuindo elementos necessários*/
dotenv.config();

const app = express();

app.use(express.json());
/*Atribuindo elementos necessários*/

/*Cadastrando um novo usuário - endpoint /SignUp*/
app.post('/signup', async (req: Request, res: Response) => {
    try {

        /*Validação do email*/
        if (!req.body.email || req.body.email.indexOf("@") === -1) {
            throw new Error("E-mail inválido.");
        }

        /*Validação dos campos */
        if (!req.body.name || !req.body.email || !req.body.password) {
            throw new Error("Parâmetros inválidos.");
        }

        /*Validação da senha*/
        if (req.body.password.length < 6) {
            throw new Error("Sua senha deve ter no mínimo 6 caracteres.");
        }
        else if (!req.body.password) {
            throw new Error("Senha inválida.")
        }

        /*Parâmetros da requisição /signup*/
        const userData = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role
        };

        /*Instanciando as classes de autenticação: HashManager e IdGenerator*/
        const hashManager = new HashManager();

        const idGenerator = new IdGenerator();

        const userDb = new UserDatabase();

        const authenticator = new Authenticator();

        const cipherText = await hashManager.hash(userData.password);

        const id = idGenerator.generate();

        await userDb.createUser(
            id,
            userData.name,
            userData.email,
            userData.role,
            cipherText
        );

        const token = authenticator.generateToken({
            id,
            role: userData.role
        });

        /*Enviando status de sucesso + token*/
        res.status(200).send({
            access_token: token
        });

    } catch (error) {
        /*Enviando status e mensagem de erro*/
        res.status(400).send({
            message: error.message
        });
    }
});
/*Fim do endpoint /signup*/

/*Logando na conta - endpoint /Login*/
app.post("/login", async (req: Request, res: Response) => {
    try {

        /*Validação do email*/
        if (!req.body.email || req.body.email.indexOf("@") === -1) {
            throw new Error("Invalid email");
        }

        /*Validação dos campos*/
        if (!req.body.email || !req.body.password) {
            throw new Error("Parâmetros inválidos.");
        }

        const userData = {
            email: req.body.email,
            password: req.body.password,
            role: req.body.role
        };

        const userDatabase = new UserDatabase();

        const user = await userDatabase.getUserByEmail(userData.email);

        const hashManager = new HashManager();

        const passwordIsCorrect = await hashManager.compare(userData.password, user.password)

        /*Validação da senha*/
        if (!passwordIsCorrect) {
            throw new Error("Senha inválida");
        }

        const authenticator = new Authenticator();

        const token = authenticator.generateToken({
            id: user.id,
            role: userData.role
        });

        res.status(200).send({
            access_token: token
        });

    } catch (error) {
        res.status(400).send({
            message: error.message,
        });
    }
});
/*Fim do endpoint  - /login*/

/*Visualizar as próprias informações do perfil- endpoint /user/profile*/
app.get("/user/profile", async (req: Request, res: Response) => {
    try {
        const authenticator = new Authenticator();
        const authenticationData = authenticator.getData(req.headers.authorization as string);

        /*Comunicação com o Banco de dados*/
        const userDb = new UserDatabase();
        const user = await userDb.getUserById(authenticationData.id);
        /*Comunicação com o Banco de dados*/

        /*Validação do tipo de perfil*/
        if (user.role !== "NORMAL") {
            res.status(401).send({ message: "Acesso negado." })
            throw new Error("Apenas um usuário normal pode acessar essa funcionalidade.")
        }
        /*Validação do tipo de perfil*/

        /*Resposta no Postman*/
        res.status(200).send({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        });
        /*Resposta no Postman*/

    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});
/*Fim do endpoint /user/profile*/

/*Visualização de outro perfil - (/user/:id)*/
app.get('/user/:id', async (req: Request, res: Response) => {
    try {
        /*Instanciando dependências para validações de autenticação*/
        const authenticator = new Authenticator();
        const authenticationData = await authenticator.getData(req.headers.authorization as string);
        /*Instanciando dependências para validações de autenticação*/

        /*Instanciando dependências para conexão com o Banco de Dados*/
        const userDB = new UserDatabase();
        const user = await userDB.getUserById(req.params.id)
        /*Instanciando dependências para conexão com o Banco de Dados*/

        /*Mandando a requisição, via endpoint, pro Banco de dados*/
        res.status(200).send({
            id: user.id,
            name: user.name,
            email: user.email
        });
        /*Mandando a requisição, via endpoint, pro Banco de dados*/
    }
    catch (error) {
        /*Encaminhando mensagens de erro que indicam falha no processo*/
        res.status(400).send({ message: error.message })
        /*Encaminhando mensagens de erro que indicam falha no processo*/
    }
});
/*Visualização de outro perfil - (/user/:id)*/

/*Criação de nova receita - (/recipe)*/
app.post('/recipe', async (req: Request, res: Response) => {
    try {
        const authenticator = new Authenticator();
        const tokenData = authenticator.getData(
            req.headers.authorization as string
        )
        const idGenerator = new IdGenerator();
        const id = idGenerator.generate();
        // const today = new Date();
        const recipeDB = new RecipeDatabase();
        
        const recipeData = {
            id: req.body.id,
            title: req.body.title, 
            description: req.body.description,
            creationDate: req.body.creationDate,
            authorId: req.body.authorId
        }

        await recipeDB.createRecipe(
            id, 
            recipeData.title, 
            recipeData.description, 
            recipeData.creationDate, 
            recipeData.authorId
            )
    }

    catch (error) {
        res.status(400).send({message: error.message})
    }
})
/*Criação de nova receita - (/recipe)*/

/*Deletar conta - endpoint /user:id*/
app.delete("/user/:id", async (req: Request, res: Response) => {
    try {
        const authenticator = new Authenticator();
        const tokenData = authenticator.getData(
            req.headers.authorization as string
        )

        if (tokenData.role !== "ADMIN") {
            throw new Error("Apenas administradores podem deletar outros usuários.")
        }

        const UserDb = new UserDatabase()
        await UserDb.deleteUser(req.params.id)

        res.status(200).send({
            message: "Usuário deletado com sucesso!"
        })

    } catch (err) {
        res.status(400).send({
            message: err.message,
        });
    }
});
/*Fim do endpoint  - /user:id*/

/*Iniciando servidor*/
const server = app.listen(process.env.PORT || 3003, () => {
    if (server) {
        const address = server.address() as AddressInfo;
        console.log(`Server is running in http://localhost:${address.port}`);
    }
    else {
        console.error(`Failure upon starting server.`);
    }
});
