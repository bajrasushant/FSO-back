import axios from "axios";

const baseUrl = '/api/persons'

const getAll = () => {
  const req = axios.get(baseUrl)
  const newData ={
    "name": "Farto Hellas",
    "number": "040-123456",
    "id": 1000
  }
  return req.then(res => res.data.concat(newData))
}

const create = newObject => {
  const req = axios.post(baseUrl, newObject)
  return req.then(res=>res.data)
}

const update = (id, newObject) => {
  const req = axios.put(`${baseUrl}/${id}`, newObject)
  return req.then(res=>res.data)
}
 
const deleteFromPhonebook = id => {
  const req = axios.delete(`${baseUrl}/${id}`)
  return req.then(res => {
    return res.data
    })
}

export default { getAll, create, update, deleteFromPhonebook}
