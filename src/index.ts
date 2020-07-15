/*Importando dependências e classes*/
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { AddressInfo } from "net";
import { IdGenerator } from "./services/IdGenerator";
import { UserDatabase } from "./data/UserDatabase";
import { Authenticator } from "./services/Authenticator";
import HashManager from "./services/HashManager";
/*Importando dependências e classes*/

/*Atribuindo elementos necessários*/
dotenv.config();
const app = express();
app.use(express.json());
/*Atribuindo elementos necessários*/

/*Cadastrando um novo usuário - /SignUp*/
app.post('/signup', async (req: Request, res: Response) => {
    try {
        /*Validação de parâmetros*/
        if (!req.body.name || !req.body.email || !req.body.password) {
            throw new Error("Parâmetros inválidos.");
        }

        if (req.body.password.length < 6) {
            throw new Error("Sua senha deve ter no mínimo 6 caracteres.");
        }
        /*Validação de parâmetros*/

        /*Parâmetros pra cadastro de usuário- SignUp*/
        const userData = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        };
        /*Parâmetros pra cadastro de usuário- SignUp*/

        /*Instanciando as classes de autenticação: HashManager e IdGenerator*/
        const hashManager = new HashManager();
        const idGenerator = new IdGenerator();
        const userDB = new UserDatabase();
        const authenticator = new Authenticator();

        const cipherText = await hashManager.hash(userData.password);
        const id = idGenerator.generate();
        await userDB.createUser(id, userData.name, userData.email, userData.password);
        const token = authenticator.generateToken({ id })
        res.status(200).send({ access_token: token })
        /*Instanciando as classes de autenticação: HashManager e IdGenerator*/

        /*Enviando status ao endpoint*/
        res.status(200).send({ message: 'Usuário cadastrado!' });
        /*Enviando status ao endpoint*/

    } catch (error) {
        /*Enviando status ao endpoint*/
        res.status(400).send({ message: error.message })
        /*Enviando status ao endpoint*/
    }
})
/*Cadastrando um novo usuário - /SignUp*/

/*Iniciando servidor*/
const server = app.listen(process.env.PORT || 3003, () => {
    if (server) {
        const address = server.address() as AddressInfo;
        console.log(`Server is running in http://localhost:${address.port}`);
    } else {
        console.error(`Failure upon starting server.`);
    }
}); 
  /*Iniciando servidor*/