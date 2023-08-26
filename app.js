const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
///API1

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }
  data = await db.all(getTodosQuery);
  response.send(data);
});
///API2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getQuery = `
  SELECT
    * 
    FROM todo
    WHERE id=${todoId};`;
  const result = await db.get(getQuery);
  response.send(result);
});
///API3

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const getQuery = `
  INSERT INTO 
  todo(id,todo,priority,status)
  VALUES('${id}','${todo}','${priority}','${status}')`;
  const result = await db.run(getQuery);
  response.send("Todo Successfully Added");
});

///API4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const requestBody = request.body;
  let updateQuery = "";
  switch (true) {
    case requestBody.status !== undefined:
      updateQuery = "Status";
      break;
    case requestBody.priority !== undefined:
      updateQuery = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateQuery = "Todo";
      break;
  }
  const getQuery = `
  SELECT 
  *
  FROM 
  todo
  WHERE id=${todoId};`;
  const result = await db.get(getQuery);
  const {
    todo = result.todo,
    priority = result.priority,
    status = result.priority,
  } = request.body;

  const updateTODOQuery = `
  UPDATE todo
  SET todo='${todo}',
  priority='${priority}',
  status='${status}'
  WHERE id=${todoId};`;
  await db.run(updateTODOQuery);
  response.send(`${updateQuery} Updated`);
});
///API5

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
    DELETE 
    FROM todo
    WHERE ID=${todoId};`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});
module.exports = app;
