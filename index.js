const http = require("http");
const url = require("url");
const fs = require("fs/promises");
const { insert, consult, edit, eliminate } = require("./consult");
const { transfer, consultTransfers } = require("./transfer");

const PORT = 3000;

const showError = (res, e) => {
  res.statusCode = 500;
  const respError = {
    error: "Error de servidor",
    message: e.message,
    code: e.code,
  };
  res.end(JSON.stringify(respError));
};

http
  .createServer(async (req, res) => {
    // / GET: Devuelve la aplicación cliente disponible en el apoyo de la prueba.
    if (req.url == "/" && req.method == "GET") {
      res.setHeader("content-type", "text/html;chartset=utf8");
      const html = await fs.readFile("index.html", "utf8");
      res.end(html);

    // usuario POST: Recibe los datos de un nuevo usuario y los almacena en PostgreSQL.
    } else if (req.url == "/usuario" && req.method === "POST") {
      let body = "";
      req.on("data", (payload) => {
        body += payload;
      });
      req.on("end", async () => {
        try {
          const bodyJSON = JSON.parse(body);
          console.log("bodyJSON:", bodyJSON);
          const data = Object.values(bodyJSON);
          const response = await insert(data);
          console.log("Usuario agregado con el saldo inicial es:", data);
          res.statusCode = 201;
          //   console.log("respuesta:", respuesta);
          res.end(JSON.stringify(response));
        } catch (e) {
          showError(res, e);
        }
      });

    // usuarios GET: Devuelve todos los usuarios registrados con sus balances.
    } else if (req.url == "/usuarios" && req.method == "GET") {
      try {
        const register = await consult();
        res.statusCode = 200;
        res.end(JSON.stringify(register.rows));
        // console.log("register:", register.rows)
      } catch (e) {
        showError(res, e);
      }

    // usuario PUT: Recibe los datos modificados de un usuario registrado y los actualiza.
    } else if (req.url.startsWith("/usuario") && req.method == "PUT") {
      const { id } = url.parse(req.url, true).query;
      let body = "";
      req.on("data", (payload) => {
        body += payload;
      });
      req.on("end", async () => {
        try {
          const datos = Object.values(JSON.parse(body));
          const respuesta = await edit(datos, id);
          //   console.log(datos, id);
          res.statusCode = 201;
          res.end(JSON.stringify(respuesta));
        } catch (e) {
          showError(res, e);
        }
      });

    // usuario DELETE: Recibe el id de un usuario registrado y lo elimina .
    } else if (req.url.startsWith("/usuario?") && req.method == "DELETE") {
      const { id } = url.parse(req.url, true).query;
      try {
        const response = await eliminate(id);
        res.statusCode = 202;
        // console.log("response:", response);
        res.end(JSON.stringify(response));
      } catch (e) {
        showError(res, e);
      }

    // transferencia POST: Recibe los datos para realizar una nueva transferencia. Se debe ocupar una transacción SQL en la consulta a la base de datos.
    } else if (req.url == "/transferencia" && req.method == "POST") {
      let body = "";
      req.on("data", (payload) => {
        body += payload;
      });
      req.on("end", async () => {
        try {
          const data = Object.values(JSON.parse(body));
          const response = await transfer(data);
          console.log("data:", data);
          // console.log("response:", response);
          res.statusCode = 201;
          res.end(JSON.stringify(response));
        } catch (error) {
          showError(res, e);
        }
      });

    // transferencias GET: Devuelve todas las transferencias almacenadas en la base de datos en formato de arreglo
    } else if (req.url == "/transferencias" && req.method == "GET") {
      try {
        const response = await consultTransfers();
        // console.log("response:", response)
        res.statusCode = 200;
        res.end(JSON.stringify(response.rows));
      } catch (error) {
        showError(res, e);
      }
    } else {
      res.statusCode = 404;
      res.end("Recurso no encontrado");
    }
  })
  .listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
