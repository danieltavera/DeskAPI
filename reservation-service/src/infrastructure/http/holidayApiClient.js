const axios = require('axios');

// cache per country+year so we don't hit the external API on every booking request
const cache = new Map();

async function getHolidays(countryCode, year) {
  const cacheKey = `${countryCode}-${year}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const baseUrl = process.env.HOLIDAY_API_URL || 'https://nagerholidays.com/api/v4';
  const { data } = await axios.get(`${baseUrl}/Holidays/${countryCode}/${year}`);
  cache.set(cacheKey, data);
  return data;
}

// returns the blocking holiday for that date, or null — fails open (returns null) if the external API is unreachable
// a holiday blocks the date if it's national, or if it's regional and matches the resource's stateCode (e.g. AU-VIC)
async function findHolidayForDate(countryCode, date, stateCode = null) {
  try {
    // read the calendar date straight from the string (first 10 chars, "YYYY-MM-DD") instead of
    // going through `new Date(...)`, which silently reinterprets offset-less strings using the
    // server's local timezone and can shift the date to the day before (see the TIMESTAMPTZ bug)
    const dateStr = String(date).slice(0, 10);
    const year = Number(dateStr.slice(0, 4));
    const holidays = await getHolidays(countryCode, year);
    return (
      holidays.find(
        (h) =>
          h.date === dateStr &&
          (h.nationalHoliday || (stateCode && h.subdivisionCodes && h.subdivisionCodes.includes(stateCode)))
      ) || null
    );
  } catch (err) {
    console.warn('Holiday API unavailable, skipping holiday check:', err.message);
    return null;
  }
}

module.exports = { getHolidays, findHolidayForDate };
