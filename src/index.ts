import express, { Request, Response } from "express";
import cors from "cors";
import { accounts } from "./database";
import { ACCOUNT_TYPE } from "./types";

const app = express();

app.use(express.json());
app.use(cors());

app.listen(3003, () => {
  console.log("Servidor rodando na porta 3003");
});

app.get("/ping", (req: Request, res: Response) => {
  res.send("Pong!");
});

app.get("/accounts", (req: Request, res: Response) => {
  res.send(accounts);
});

//Código da aula a partir daqui
app.get("/accounts/:id", (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const result = accounts.find((account) => account.id === id);

    if (!result) {
      //res.statusCode = 404;
      res.status(404);
      throw new Error("Conta não encontrada. Verifique a 'Id'.");
    }
    res.status(200).send(result);
  } catch (error) {
    console.log(error);
    if (res.statusCode === 200) {
      res.status(500);
    }
    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado.");
    }
  }
});

app.delete("/accounts/:id", (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    //id.startWith("a");
    if (id[0] !== "a") {
      res.status(400);
      throw new Error("id inválido. Deve iniciar com letra 'a'");
    }

    const accountIndex = accounts.findIndex((account) => account.id === id);

    if (accountIndex >= 0) {
      accounts.splice(accountIndex, 1);
    }

    res.status(200).send("Item deletado com sucesso");
  } catch (error) {
    if (res.statusCode === 200) {
      res.status(500);
    }
    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado.");
    }
  }
});

app.put("/accounts/:id", (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const newId = req.body.id as string | undefined;
    const newOwnerName = req.body.ownerName as string | undefined;
    const newBalance = req.body.balance as number | undefined;
    const newType = req.body.type as ACCOUNT_TYPE | undefined;

    if (newBalance !== undefined) {
      if (typeof newBalance !== "number") {
        res.status(404);
        throw new Error('O campo balance deve ser do tipo "number"');
      }
      if (newBalance < 0) {
        res.status(400);
        throw new Error("'balance' deve ter valor maior ou igual a zero");
      }
    }
    if (newType !== undefined) {
      if (
        newType !== ACCOUNT_TYPE.GOLD &&
        newType !== ACCOUNT_TYPE.BLACK &&
        ACCOUNT_TYPE.PLATINUM
      ) {
        res.status(400);
        throw new Error("Type deve ser um tipo válido: Ouro, platina ou Black");
      }
    }

    //id precisa começar com a letra a
    if (newId !== undefined) {
      if (typeof newId !== "string") {
        res.status(400);
        throw new Error("Id inválido. Precisa ser do tipo string");
      }
      if (!newId.startsWith("a")) {
        res.status(400);
        throw new Error("id inválido. Deve iniciar com letra 'a'");
      }
    }
    //newOwnerName precisa ter no mínimo dois caracteres
    if (newOwnerName !== undefined) {
      if (typeof newOwnerName !== "string") {
        res.status(400);
        throw new Error("'ownerName' inválido. Precisa ser do tipo string");
      }
      if (newOwnerName.length < 2) {
        res.status(400);
        throw new Error(
          "'ownerName' inválido. Deve ter no mínimo dois caracteres"
        );
      }
    }

    const account = accounts.find((account) => account.id === id);

    if (account) {
      account.id = newId || account.id;
      account.ownerName = newOwnerName || account.ownerName;
      account.type = newType || account.type;

      account.balance = isNaN(newBalance) ? account.balance : newBalance;
    }

    res.status(200).send("Atualização realizada com sucesso");
  } catch (error) {
    if (res.statusCode === 200) {
      res.status(500);
    }
    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado.");
    }
  }
});
