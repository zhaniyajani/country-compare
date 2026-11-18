# Country Compare

A web application that compares two countries using real data from the **World Bank Indicators API**.
You choose two countries, one indicator and a range of years. The app shows statistics, a line chart and a year by year table.

**GitHub link:** https://github.com/zhaniyajani/country-compare


## Project description

Country Compare answers a simple question: *"How do two countries differ over time?"*

1. The user opens the home page and fills in a short form: two countries, an indicator, and "from" and "to" years.
2. The server checks the input (validation) and asks the World Bank API for the data.
3. The result page shows:
   - a short summary of which country is ahead on average,
   - a card with statistics for each country (average, highest, lowest, growth),
   - a line chart of both countries,
   - a table with the values year by year.
4. From the result page the user can open a page with more details about each country.

If something goes wrong (wrong input, slow API, no internet), the user sees a friendly message and not a crash.

## API used

**World Bank Indicators API (v2)**
https://data.worldbank.org/indicator
`https://datahelpdesk.worldbank.org/knowledgebase/articles/898581-api-basic-call-structures`


Available indicators:

| Indicator | World Bank code | Unit |
|---|---|---|
| GDP per capita | `NY.GDP.PCAP.CD` | US$ |
| Population | `SP.POP.TOTL` | people |
| Life expectancy | `SP.DYN.LE00.IN` | years |
| Internet users | `IT.NET.USER.ZS` | % of population |

## Features

- Compare **two countries** on one of **four indicators** over a range of years (1960 to the current year).
- Statistics for each country: **average, highest, lowest and growth in percent**.
- A summary sentence that says which country is ahead on average.
- A **line chart** (Chart.js) and a **year-by-year table**. Missing years are shown as a dash.
- A **country page** with the capital, region, income level and the latest value of every indicator.
- **Input validation** on the server for both the form and the result address, with clear messages.
- **Friendly error handling**: custom 404 page and a central error handler (timeout, too many requests, API error, no connection).
- **Resilient API calls**: 15-second timeout, up to 5 attempts with a growing pause, and an in-memory cache.
- Clean, **responsive** design that works on phones.
- Code in **MVC style** with comments that explain the logic.

## Screenshots
**Home page with the form**
![Home page](screenshots/home.png)

**Result page with statistics, chart and table**
![Result page](screenshots/result.png)

**Friendly error page**
![Error page](screenshots/error.png)

## Routes
| Method | Address | What it does |
|---|---|---|
| GET | `/` | Home page with the comparison form |
| GET | `/about` | About page |
| POST | `/compare` | Validates the form, then redirects to `/result` |
| GET | `/result` | Validates the query, calls the API and shows the result. Query parameters: `country1`, `country2`, `indicator`, `fromYear`, `toYear` |
| GET | `/country/:code` | Details of one country, for example `/country/KAZ` |
| any | any other address | 404 page |

Example: `/result?country1=KAZ&country2=DEU&indicator=SP.POP.TOTL&fromYear=2010&toYear=2020`

## Technologies

- **Node.js** and **Express 5** (server and routing)
- **EJS** (HTML templates)
- **Axios** (requests to the API)
- **dotenv** (settings from the `.env` file)
- **Chart.js** (the chart, loaded from a CDN)

## Project structure (MVC)

```
country-compare/
|-- app.js                    start of the app: settings, middleware, routes, server
|-- routes/
|   `-- index.js              which address goes to which controller function
|-- controllers/
|   |-- homeController.js     home page and About page
|   |-- compareController.js  redirect after the form, statistics, result page
|   `-- countryController.js  details of one country
|-- services/
|   `-- worldBankService.js   ALL requests to the World Bank API (timeout, retries, cache)
|-- middleware/
|   |-- logger.js             prints time, method and address of each request
|   |-- validateCompare.js    checks the countries, indicator and years
|   |-- notFound.js           404 page
|   `-- errorHandler.js       central error handler
|-- config/
|   `-- indicators.js         the four indicators (code, name, unit)
|-- utils/
|   `-- formatNumber.js       19600000 becomes "19.60M"
|-- views/                    EJS pages (index, result, country, about, error)
|   `-- partials/             header and footer used by every page
|-- public/
|   `-- style.css             styles
|-- screenshots/              images for this README
|-- .env.example              example of the settings file
`-- package.json
```

## Installation and run

**Requirements:** Node.js 18 or newer (tested with Node 24) and an internet connection.

1## How to run

You need [Node.js](https://nodejs.org/) and an internet connection.

```bash
git clone https://github.com/zhaniyajani/country-compare.git
cd country-compare
npm install
copy .env.example .env
npm start
```

Then open **http://localhost:3000** in your browser.

On macOS or Linux, use `cp .env.example .env` instead of `copy .env.example .env`.

### Settings (`.env`)

| Variable | Meaning | Default |
|---|---|---|
| `PORT` | The port of the server | `3000` |
| `API_URL` | The address of the World Bank API | `https://api.worldbank.org/v2` |

The file `.env` is not stored in Git (it is in `.gitignore`). Only `.env.example` is stored.

## Error handling and validation

- **Validation** (`middleware/validateCompare.js`) runs before the controller. It checks that both countries are chosen, different and real, that the indicator is one of the four, and that the years are whole numbers between 1960 and the current year with "from" before "to". Wrong input shows the form again with all messages (status 400).
- **404** (`middleware/notFound.js`) catches every address that no route knows.
- **Central error handler** (`middleware/errorHandler.js`) turns technical errors into short, safe messages. The technical details are printed only in the terminal.
- The World Bank API is sometimes slow or answers with errors for a moment. The service waits up to 15 seconds per attempt, tries up to 5 times with a growing pause, and remembers answers it already received.

## Notes

- The first request after starting the server can take a few seconds, because the API is slow at times. The same request is instant the second time (cache).
- The chart needs internet to download Chart.js. Without internet the page still works, only the chart is missing.
- Some years have no data in the World Bank database. The app skips empty values.

## AI use declaration (AI-1)
**Student name / ID:** Janikeyeva Zhaniya
**AI tool(s) used** Claude, ChatGPT
**What I asked the AI to do** it helped me in choosing an API in the beginning, but all the checking whether it works or not was made by me; explain an Axios error; I sent him my first css design and asked to enhance it, structure in a right way and make it more stylish; create a checklist of what should I do and use; give me a starting point; review my error middleware, check my code whether it was right or wrong, where I have mistakes; drafting README; according to given code by me write comments for them, Debugging errors (for example slow API answers, EJS comment errors, 500 pages); at first I didnt know how to do commits and everything else in github, therefore I asked about it from claude; 
**Which files/parts contain AI-assisted code**: CSS 50/50, some of the files have Ai generated comments(but all of them where checked and corrected by me), this file 80%
**What I changed, tested or wrote myself**: I ran the application, tested the pages and the error cases, around 70% of comments, working with all of the codes, experimenting; but overall I checked everything I tried to use from AI especially

I confirm I understand and can explain all submitted code
AI tools were used in this project and are disclosed here and in the separate AI Declaration submitted in Canvas.





- Data: [World Bank Open Data](https://data.worldbank.org/)
- Chart: [Chart.js](https://www.chartjs.org/)
https://www.youtube.com/watch?v=ZpfseYy5Hxg
https://datahelpdesk.worldbank.org/knowledgebase/articles/898581-api-basic-call-structures 
https://datahelpdesk.worldbank.org/knowledgebase/articles/1886674-new-features-and-enhancements-in-the-v2-api 
