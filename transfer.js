const { Pool } = require("pg");

const config = {
  user: "jrodriguez",
  host: "localhost",
  password: "85208520",
  port: 5432,
  database: "bancosolar",
};

const pool = new Pool(config);

const transfer = async (data) => {
  try {
    await pool.query("BEGIN");
    const discount = {
      text: `UPDATE usuario 
        SET balance = balance - ${data[2]}
        WHERE nombre = '${data[0]}' 
        RETURNING *`,
    };
    const discounting = await pool.query(discount);
    const accredit = {
      text: `UPDATE usuario 
        SET balance = balance + ${data[2]} 
        WHERE nombre = '${data[1]}' 
        RETURNING *`,
    };
    const accreditation = await pool.query(accredit);
    console.log(
      `El usuario "${data[0]}" ha transferido un monto de "$${data[2]}" al usuario "${data[1]}"`
    );

    const registerTable = {
      text: "INSERT INTO transferencia (emisor, receptor, monto, fecha) VALUES ($1, $2, $3, $4)",
      values: [
        discounting.rows[0].id,
        accreditation.rows[0].id,
        data[2],
        new Date(),
      ],
    };
    await pool.query(registerTable);
    await pool.query("COMMIT");
    const datas = [
      discounting.rows[0].nombre,
      accreditation.rows[0].nombre,
      data[2],
      new Date(),
    ];
    return datas;
  } catch (error) {
    await pool.query("ROLLBACK");
    console.log("Ha ocurrido um error con la transferencia: ", error.code);
    return error;
  }
};

const consultTransfers = async () => {
  const consult = {
    rowMode: "array",
    text: `SELECT transferencia.fecha, 
    (SELECT usuario.nombre 
    FROM usuario 
    WHERE transferencia.emisor = usuario.id)
    as emisor, 
    usuario.nombre as receptor, 
    transferencia.monto 
    FROM usuario 
    INNER JOIN transferencia 
    ON transferencia.receptor = usuario.id 
    ORDER BY transferencia.id;`,
  };
  try {
      const result = await pool.query(consult)
      return result;
  } catch (error) {
      console.log(`Ha ocurrido un error en consultar las transferencias: ${error.code}`);
      return error
  };
};

module.exports = {
  transfer,
  consultTransfers
};
