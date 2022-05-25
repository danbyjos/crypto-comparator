const axios = require('axios');

async function fetchGetRequest(url) {
  return await axios.get(url)  
  .then((response) => {return response.data;})
  .catch((error) => {
    console.error("Error response from service "+error.message);
    return "error"  
  });
}
export {fetchGetRequest};