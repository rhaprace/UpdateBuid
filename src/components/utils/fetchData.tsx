export const options = {
  method: 'GET',
  headers: {
    'x-rapidapi-key': import.meta.env.VITE_RAPID_API_KEY,
    'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
  }
};

export const fetchData = async (url, options) => {
const res = await fetch(url, options);
  const data = await res.json();

  return data;
};
