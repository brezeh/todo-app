import React from 'react'
import './App.css'
import Dexie from 'dexie'
import { useLiveQuery } from 'dexie-react-hooks'

const Db = new Dexie('todoapp')
Db.version(1).stores({
  todos: '++id,task,completed,date',
})

const { todos } = Db

const App = () => {
  const allItems = useLiveQuery(() => todos.toArray(), [])

  const completedTasks = allItems?.filter(item => item.completed).length || 0
  const totalTasks = allItems?.length || 0
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const addTask = async (event) => {
    event.preventDefault()
    const taskField = document.querySelector("#taskInput")

    const task = taskField['value']

    const id = await todos.add({
      task: task,
      completed: false
    })

    console.log(`todos ${task} sucessfully added. Got id ${id}`)

    taskField['value'] = ''
  } 

  const deleteTask = async (id) => todos.delete(id)

  const togglestatus = async (id, event) => {
    await todos.update(id, { completed: !!event.target.checked})
  }

  return (
    <div className="container">
      <h3 className="teal-text center-align">Todo App</h3>
      <div className="completion-status">
        <p className="center-align"> {`Completed ${completedTasks} / ${totalTasks} tasks`}</p>
        <p className="center-align"> {`Completion: ${completionPercentage.toFixed(2)}%`}</p>
      </div>
      <div className="circle-container center-align">
        <div
          className="task-circle"
          style={{
            background: `conic-gradient(#4CAF50 ${completionPercentage}%, #eeeeee ${completionPercentage}%)`
          }}
        ></div>
      </div>
      <form className="add-item-form" onSubmit={addTask}>
        <input
          type="text"
          id="taskInput"
          className="itemField"
          placeholder="What do you want to do today?"
          required
        />
        <button type="submit" className="waves-effect btn teal right">
          Add
        </button>
      </form>

      <div className="card white darken-1">
        <div className="card-content">
          {allItems?.map(({id, completed, task}) => (
            <div className="row" key={id}>
              <p className="col s10">
                <label>
                  <input 
                  type="checkbox" 
                  checked={completed} 
                  className="checkbox-blue"
                  onChange={(event) => togglestatus(id, event)}
                  />
                  <span className={`black-text ${completed &&'strike-text'}`}>{task}</span>
                </label>
              </p>
              <i 
                onClick={() => deleteTask(id)}
                className="col s2 material-icons delete-button"
              >
                delete
              </i>
          </div>
        ))}
        </div>
      </div>
    </div>
  )
}

export default App
