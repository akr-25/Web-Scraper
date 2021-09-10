// importing the required library 
const got = require('got');
const cheerio = require('cheerio');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// creating a experss app
const app = express();

// for logging all the request made to the server
app.use(morgan("common"));

// to handle cross origin request without crying
app.use(cors())

// to completely parse the incoming request, not required here in this api... but i'm lazy!
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/api/all', async (req, res) => {
    try {
        const response = await got('https://goldprice.org/cryptocurrency-price');
        const $ = cheerio.load(response.body, null, false);
        var data = [];
        $('tbody tr').each((i, element) => {

            var title, value;
            $(element).find('td').each((j, td) => {
                if (j === 1) {
                    title = $(td).text();
                }
                if (j === 3) {
                    value = $(td).text();
                }
            })
            var info = {
                title: title.trim(),
                value: value.trim()
            }
            data.push(info);
        });
        res.status(200).send(JSON.stringify(data));
        fs.writeFileSync('data.json', JSON.stringify(data))
    } catch (err) {
        // console.log(err.response.body)
        res.status(500).send(err);
    }
})

app.get('/api/crypto/:name',async (req, res) => {
    let searchQuery = req.params.name;
    try {
        const response = await got('https://goldprice.org/cryptocurrency-price');
        const $ = cheerio.load(response.body, null, false);
        var data = null;
        $('tbody tr').each((i, element) => {

            var title, value;
            $(element).find('td').each((j, td) => {
                if (j === 1) {
                    title = $(td).text();
                }
                if (j === 3) {
                    value = $(td).text();
                }
            })
            var info = {
                title: title.trim(),
                value: value.trim()
            }
            if (title.trim().toLowerCase() ===  searchQuery.trim().toLowerCase())
            {
                data = JSON.stringify(info);
            }
        });
        if(data !== null)
        return res.status(200).send(data);
        else
        return res.status(404).send(`info about ${searchQuery} does not exist in our database`);
        // fs.writeFileSync('data.json', JSON.stringify(data))
    } catch (err) {
        // console.log(err.response.body)
        return res.status(500).send(err);
    }
})

app.get('/', (req,res)=>{
    res.status(200).send("API says hi \n, please use <your-ip>/api/all (for all data)\n or \n<your-ip>/api/crypto/<crypto-name> (for specific crypto regarding data)")
})

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`app running on http://localhost:${port}`);
});