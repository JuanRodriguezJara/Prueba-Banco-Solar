const { Pool } = require("pg");

const config = {
    user: "jrodriguez",
    host: "localhost",
    password: "85208520",
    port: 5432,
    database: "bancosolar",
};

const pool = new Pool(config);

const insert = async (data) => {
    const consult = {
        text: "INSERT INTO usuario (nombre, balance) VALUES ($1, $2)",
        values: data,
    }
    try {
        const result = await pool.query(consult);
        console.log("AGREGAR: Se ha insertado un nuevo registro en la tabla usuario.");
        return result;
    } catch (error) {
        console.log(error.code);
        throw error;
    }
};

const consult = async () => {
    const consulta = {
        text: "SELECT nombre, balance FROM usuario ORDER BY id",
    }

    try {
        const result = await pool.query(consulta)
        return result
    } catch (error) {
        console.log("Ha habido un error en consultar los usuarios: " + error.code)
        return error
    }
}

const edit = async (datos, id) => {
    const consulta = {
        text: `UPDATE usuario SET nombre = $1, balance = $2 WHERE id = ${id} RETURNING*`,
        values: datos
    }
    try {
        const result = await pool.query(consulta)
        console.log(`El usuario de con id ${id} ha sido modificado`)
        return result
    } catch (error) {
        console.log("Ha habido un error al modificar el usuario " + error.code)
    }
}


module.exports = {
    insert,
    consult,
    edit
}