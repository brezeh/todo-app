import React, { useState } from 'react'
import './App.css'
import Dexie from 'dexie'
import { useLiveQuery } from 'dexie-react-hooks'

const Db = new Dexie('todoapp')
Db.version(1).stores({
  todos: '++id,task,completed,date, listId',
  TodoList: '++id, name',
})

const { todos, TodoList } = Db

const App = () => {
  const [newListName, setNewListName] = useState('')
  const [forceUpdate, setForceUpdate] = useState(0)
  
  const allLists = useLiveQuery(() => TodoList.toArray(), [])
  const allItems = useLiveQuery(() => todos.toArray(), [])

  const completedTasks = allItems?.filter(item => item.completed).length || 0
  const totalTasks = allItems?.length || 0
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const addTask = async (event, listId) => {
    event.preventDefault()
    const taskField = document.querySelector(`#taskInput-${listId}`)
    const task = taskField['value']

    if (task.trim()) {
      await todos.add({
        task: task,
        completed: false,
        listId: listId,
      })

      taskField['value'] = ''
    } 
  }

  const deleteTask = async (id) => todos.delete(id)

  const togglestatus = async (id, event) => {
    await todos.update(id, { completed: !!event.target.checked})
  }

  const addNewList = async () => {
    if (newListName.trim()) {
      const newListId = await TodoList.add({name: newListName})
      setNewListName ('')
      setForceUpdate(forceUpdate + 1)
      if (newListName === "To Do 3/2/25") {
        const initialListTasks = await todos.where('listId').equals(1).toArray()
        await todos.bulkAdd(initialListTasks.map(task => ({
          task: task.task,
          completed: task.completed,
          listId: newListId,
        })))
      }
      if (newListName === "Initial List") {
        await todos.bulkAdd([
          { task: "Initial Task 1", completed: false, listId: newListId },
          { task: "Initial Task 2", completed: false, listId: newListId }
        ])
      }
    }
  }

  const deleteList = async (id) => {
    const list = await TodoList.get(id)
    if (list.name !== 'Initial List') {
      await TodoList.delete(id)
      await todos.where('listId').equals(id).delete()
      setForceUpdate(forceUpdate + 1)
    }
  }

  const clearTasks = async (listId) => {
    await todos.where('listId').equals(listId).delete()
    setForceUpdate(forceUpdate + 1)
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
      <div className="add-list-form">
        <input
          type="text"
          id="newListInput"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          className="itemField"
          placeholder="New List Name"
          required
        />
        <button onClick={addNewList} className="waves-effect btn teal right">
          Add New List
        </button>
      </div>
      {allLists?.map((list) => (
        <div key={list.id} className="todo-list">
          <div className="list-header">
            <h4>{list.name}</h4>
            {list.name !== 'Initial List' && (
              <i
                onClick={() => deleteList(list.id)}
                className="material-icons delete-button"
              >
                delete
              </i>
            )}
            <button
              onClick={() => clearTasks(list.id)}  // This will allow clearing tasks for any list, including the "Initial List"
              className="waves-effect btn red right"
            >
              Clear Tasks
            </button>
          </div>
          
          <form className="add-item-form" onSubmit={(event) => addTask(event, list.id)}>
            <input
              type="text"
              id={`taskInput-${list.id}`}
              className="itemField"
              placeholder="What do you want to do today?"
              required
            />
            <button type="submit" className="waves-effect btn teal right">
              Add Task
            </button>
          </form>

          <div className="card white darken-1">
            <div className="card-content">
              {allItems?.filter(item => item.listId === list.id).map(({ id, completed, task }) => (
                <div className="row" key={id}>
                  <p className="col s10">
                    <label>
                      <input
                        type="checkbox"
                        checked={completed}
                        className="checkbox-blue"
                        onChange={(event) => togglestatus(id, event)}
                      />
                      <span className={`black-text ${completed && 'strike-text'}`}>{task}</span>
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
      ))}
    </div>
  )
}

export default App