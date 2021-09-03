import axios from 'axios';
import { restaurantsIndex } from '../urls/index'

export const fetchRestaurants =() => {
  return axios.get(restaurantsIndex)
  .then(response => {
    return response.data
  })
  .catch((error) => console.error(error))
}