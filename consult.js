const { Pool } = require("pg");

const config = {
    user: "Aqui agregar usuario Postgres",
    host: "localhost",
    password: "Aqui agregar contraseña Postgres",
    port: 5432,
    database: "bancosolar"
}

const pool = new Pool(config)

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
        console.log("El código del error es el siguiente: " + error.code)
        throw error;        
    };
};

const consult = async () => {
    const consulta = {
        text: "SELECT id, nombre, balance FROM usuario ORDER BY id",
    }
    try {
        const result = await pool.query(consulta)
        return result
    } catch (error) {
        console.log("Ha habido un error en consultar los usuarios: " + error.code)
        return error
    }
}

const edit = async (data, id) => {
    const consulta = {
        text: `UPDATE usuario SET 
        nombre = $1, 
        balance = $2 
        WHERE id = ${id} 
        RETURNING*`,
        values: data
    };
    try {
        const result = await pool.query(consulta)
        console.log(`El usuario con id ${id} ha sido modificado`)
        return result
    } catch (error) {
        console.log("Ha habido un error al modificar el usuario " + error.code)
    };
};

const eliminate = async (id) => {
    const consult = {
        text: `DELETE FROM usuario WHERE id = ${id}`
    }
    const consult2 = {
        text: `DELETE FROM transferencia WHERE emisor = ${id}`,
    };
    const consult3 = {
        text: `DELETE FROM transferencia WHERE receptor = ${id}`
    }
    try {
        const result = await pool.query(consult);
        const result2 = await pool.query(consult2);
        const result3 = await pool.query(consult3);
        console.log("ELIMINAR: Se ha eliminado un usuario con sus referencias y transferencias.");
        return result;
    } catch (error) {
        console.log(error.code);
        throw error;
    };
};



module.exports = { 
    insert,
    consult,
    edit,
    eliminate
}