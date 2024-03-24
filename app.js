const express = require('express')
app = express()
const path = require('path')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const date = require('date-fns')
app.use(express.json())
db_path = path.join(__dirname, 'todoApplication.db')
let db = null
const intializeSeverDatabasae = async () => {
  try {
    db = await open({
      filename: db_path,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server started succesfully at https://localhost:3000')
    })
  } catch (e) {
    console.log(`${e} in connecting to Database`)
    process.exit(1)
  }
}
intializeSeverDatabasae()
const hasPriorityPropertyAndHasStatusProperty = request => {
  return request.status !== undefined && request.priority !== undefined
}
const hasPriorityProperty = request => {
  return request.priority !== undefined
}
const hasStatusProperty = request => {
  return request.status !== undefined
}
const hasCategoryAndPriority = request => {
  return request.category !== undefined && request.priority !== undefined
}
const hasCategoryAndStatus = request => {
  return request.category !== undefined && request.status !== undefined
}
const hasCategory = request => {
  return request.category !== undefined
}
app.get('/todos/', async (request, response) => {
  const {search_q = ''} = request.query
  let flag = false
  let getTodoQuery = ''
  switch (true) {
    case hasPriorityPropertyAndHasStatusProperty(request.query):
      if (
        (request.query.priority === 'HIGH' ||
          request.query.priority === 'MEDMIUM' ||
          request.query.priority === 'LOW') &&
        (request.query.status === 'TO DO' ||
          request.query.status == 'IN PROGRESS' ||
          request.query.status === 'DONE')
      ) {
        flag = true
        getTodoQuery = `
                select 
                *
                from 
                todo
                where todo like '%${search_q}%' AND status='${request.query.status}' AND priority='${request.query.priority}';`
      } else {
        if (
          !(
            request.query.status === 'TO DO' ||
            request.query.status == 'IN PROGRESS' ||
            request.query.status === 'DONE'
          )
        ) {
          response.status(400)
          response.send('Invalid Todo Status')
        } else {
          response.status(400)
          response.send('Invalid Todo Priority')
        }
      }
      break
    case hasStatusProperty(request.query):
      if (
        request.query.status === 'TO DO' ||
        request.query.status == 'IN PROGRESS' ||
        request.query.status === 'DONE'
      ) {
        flag = true
        getTodoQuery = `
              select 
              *
              from 
              todo
              where todo like '%${search_q}%' AND status='${request.query.status}';`
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break
    case hasPriorityProperty(request.query):
      if (
        request.query.priority === 'HIGH' ||
        request.query.priority === 'MEDMIUM' ||
        request.query.priority === 'LOW'
      ) {
        flag = true
        getTodoQuery = `
            select 
            *
            from 
            todo
            where todo like '%${search_q}%' AND priority='${request.query.priority}';`
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break
    case hasCategoryAndStatus(request.query):
      if (
        (request.query.category === 'WORK' ||
          request.query.category === 'HOME' ||
          request.query.category === 'LEARNING') &&
        (request.query.status === 'TO DO' ||
          request.query.status == 'IN PROGRESS' ||
          request.query.status === 'DONE')
      ) {
        flag = true
        getTodoQuery = `
            select 
            *
            from 
            todo
            where category='%${request.query.category}%' AND status='${request.query.status}';`
      } else {
        if (
          !(
            request.query.status === 'TO DO' ||
            request.query.status == 'IN PROGRESS' ||
            request.query.status === 'DONE'
          )
        ) {
          response.status(400)
          response.send('Invalid Todo Status')
        } else {
          response.status(400)
          response.send('Invalid Todo Category')
        }
      }
      break
    case hasCategory(request.query):
      if (
        request.query.category === 'WORK' ||
        request.query.category === 'HOME' ||
        request.query.category === 'LEARNING'
      ) {
        console.log(request.query.category)
        flag = true
        getTodoQuery = `
            select 
            *
            from 
            todo
            where category LIKE '%${request.query.category}%';`
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    case hasCategoryAndPriority(request.query):
      if (
        (request.query.category === 'WORK' ||
          request.query.category === 'HOME' ||
          request.query.category === 'LEARNING') &&
        (request.query.priority === 'HIGH' ||
          request.query.priority == 'LOW' ||
          request.query.priority === 'MEDIMUM')
      ) {
        flag = true
        getTodoQuery = `
            select 
            *
            from 
            todo
            where category='%${request.query.category}%' AND priority='${request.query.priority}';`
      } else {
        if (
          !(
            request.query.category === 'TO DO' ||
            request.query.category == 'IN PROGRESS' ||
            request.query.category === 'DONE'
          )
        ) {
          response.status(400)
          response.send('Invalid Todo Category')
        } else {
          response.status(400)
          response.send('Invalid Todo priority')
        }
      }
      break
    default:
      flag = true
      getTodoQuery = `
            select 
            *
            from 
            todo
            where todo like '%${search_q}%';`

      break
  }
  if (flag) {
    let getTodo = await db.all(getTodoQuery)
    console.log(getTodo)
    getTodo = getTodo.map(item => {
      return {
        id: item.id,
        todo: item.todo,
        priority: item.priority,
        status: item.status,
        category: item.category,
        dueDate: item.due_date,
      }
    })
    response.send(getTodo)
  }
})
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  let getTodoQuery = `
        select 
        *
        from 
        todo
        where id=${todoId}`
  let getTodo = await db.all(getTodoQuery)
  getTodo = getTodo.map(item => {
    return {
      id: item.id,
      todo: item.todo,
      priority: item.priority,
      status: item.status,
      category: item.category,
      dueDate: item.due_date,
    }
  })
  response.send(getTodo[0])
})
app.get('/agenda/', async (request, response) => {
  let {date} = request
  console.log(date)
})
app.post('/todos/', async (request, response) => {
  let {id, todo, priority, status, category, dueDate} = request.body
  dueDate = dueDate.split('-')
  if (
    (status === 'TO DO' || status == 'IN PROGRESS' || status === 'DONE') &&
    (priority === 'HIGH' || priority === 'MEDMIUM' || priority === 'LOW') &&
    (category === 'WORK' || category === 'HOME' || category === 'LEARNING') &&
    dueDate[0] > 0 &&
    dueDate[1] > 0 &&
    dueDate[2] > 0 &&
    dueDate[2] <= 31 &&
    dueDate[1] <= 12
  ) {
    dueDate = dueDate.join('-')
    let addTodoQuery = `insert into todo values(${id},'${todo}','${priority}','${status}','${category}',${dueDate})`
    await db.all(addTodoQuery)
    response.send('Todo Successfully Added')
  } else {
    if (!(status === 'TO DO' || status == 'IN PROGRESS' || status === 'DONE')) {
      response.status(400)
      response.send('Invalid Todo Status')
    } else if (
      !(priority === 'HIGH' || priority === 'MEDMIUM' || priority === 'LOW')
    ) {
      response.status(400)
      response.send('Invalid Todo Priority')
    } else if (
      !(category === 'WORK' || category === 'HOME' || category === 'LEARNING')
    ) {
      response.status(400)
      response.send('Invalid Todo Category')
    } else if (
      !(
        dueDate[0] > 0 &&
        dueDate[1] > 0 &&
        dueDate[2] > 0 &&
        dueDate[2] <= 31 &&
        dueDate[1] <= 12
      )
    ) {
      response.status(400)
      response.send('Invalid Due Date')
    }
  }
})
app.put('/todos/:todoId', async (request, response) => {
  const {todoId} = request.params
  let {status, priority, todo, category, dueDate} = request.body

  let updateTodoQuery = ''
  switch (true) {
    case status !== undefined:
      if (status === 'TO DO' || status == 'IN PROGRESS' || status === 'DONE') {
        updateTodoQuery = `update todo set status='${status}' where id=${todoId}`
        await db.run(updateTodoQuery)
        response.send('Status Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break
    case priority !== undefined:
      if (priority === 'HIGH' || priority === 'MEDMIUM' || priority === 'LOW') {
        updateTodoQuery = `update todo set priority='${priority}' where id=${todoId}`
        await db.run(updateTodoQuery)
        response.send('Priority Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break
    case category !== undefined:
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        updateTodoQuery = `update todo set category='${category}' where id=${todoId}`
        await db.run(updateTodoQuery)
        response.send('Category Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    case dueDate !== undefined:
      dueDate = dueDate.split('-')
      let dummyDate = new Date(dueDate[0], dueDate[1], dueDate[2])
      if (
        dueDate[0] > 0 &&
        dueDate[1] > 0 &&
        dueDate[2] > 0 &&
        dueDate[2] <= 31 &&
        dueDate[1] <= 12
      ) {
        dummyDate = date.format(dummyDate, 'yyyy-mm-dd')
        console.log(dummyDate)
        updateTodoQuery = `update todo set due_date='${dueDate}' where id=${todoId}`
        await db.run(updateTodoQuery)
        response.send('Due Date Updated')
      } else {
        response.status(400)
        response.send('Invalid Due Date')
      }
      break
    default:
      updateTodoQuery = `update todo set todo='${todo}' where id=${todoId}`
      await db.run(updateTodoQuery)
      response.send('Todo Updated')
      break
  }
})
app.delete('/todos/:todoId', async (request, response) => {
  const {todoId} = request.params
  let deleteTodoQuery = `delete from todo where id=${todoId}`
  await db.all(deleteTodoQuery)
  response.send('Todo Deleted')
})

module.exports = app
