const puppeteer = require('puppeteer')
const fs = require('fs');
const fetch = require('node-fetch')
const device = require("puppeteer/DeviceDescriptors")
const iphone = device['iPhone 6']

const cookiesPath = "cookies.txt"
let hour = new Array(12)
let picNum = 1


async function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



function download(){
    let num= 1  
    fetch('https://www.reddit.com/r/dankmemes/hot.json')
    .then(res => res.json())
    .then(json => {

        const children = json.data.children;
        children.slice(1,14).forEach(element => {
            //console.log(element.data.url)
            let memePic = fs.createWriteStream("./meme/" + num + ".jpg")
            fetch(element.data.url).then(res =>{
                res.body.pipe(memePic)
            })

            num += 1
        })
       
    }).catch(error => console.error(error))
}

async function loadCookies(page){
    const previousSession = fs.existsSync(cookiesPath) 
    if (previousSession) { // kollar om cookies finns
        const content = fs.readFileSync(cookiesPath) // läser in dom
        const cookiesArr = JSON.parse(content) 
        if (cookiesArr.length !== 0) {
            for (let cookie of cookiesArr) {
                await page.setCookie(cookie) // lägger in puppeteer
            }
            console.log('cookies har laddats in\n')
        }
    }

}



async function upload(num) {

    const selectors = {
        post: "#react-root > section > nav.NXc7H.f11OC > div > div > div.KGiwt > div > div > div.q02Nz._0TPg",
        next: "#react-root > section > div.Scmby > header > div > div.mXkkY.KDuQp > button",
        expand: "#react-root > section > div.gH2iS > div.N7f6u.Bc-AD > div > div > div > button.pHnkA",
        wait: "#react-root > section > nav.NXc7H.f11OC > div > div > div.KGiwt > div > div > div:nth-child(1) > a > span"
    }
    

    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.emulate(iphone)

    // Laddar cookies
    loadCookies(page)

    await page.goto('https://instagram.com')
    
    // POST KNAPPEN
    try{
        await page.waitForSelector(selectors.post)
    }
    catch(err){
        await page.screenshot({path: "error.jpg"})
        console.log(err)
    }   
    await page.click(selectors.post)
    console.log("Post knappen")

    // LADDAR UPP MEME
    const fileinput = await page.$('input[type=file]')
    await fileinput.uploadFile("./meme/" + num + ".jpg")
    console.log("laddar upp bild")

    // EXPAND OCH NEXT KNAPPARNA 


    try{ // kollar om expand knappen finns. 
        await page.waitForSelector(selectors.expand)
        await page.click(selectors.expand)
        console.log("expand button found")
    }
    catch(err){
        console.log("expand button not found")
    }

    
    await page.click(selectors.next)
    console.log("Next knappen")
    
    await timeout(2000)

    // SHARE KNAPPEN (SAMMA SELECTOR SOM NEXT)
    console.log("Share knappen")
    try{
        await page.waitForSelector(selectors.next)
    }
    catch(err){
        await page.screenshot({path: "error.jpg"})
        console.log(err)
    }
    await page.click(selectors.next)

    // VÄNTAR SÅ BILDEN HINNER DELAS. 
    try{
        await page.waitForSelector(selectors.wait)
    }
    catch(err){
        await page.screenshot({path: "error.jpg"})
        console.log(err)
    }
    await browser.close()

}



console.log("startar upp..", new Date().getHours()+":"+new Date().getMinutes())
let dwnld = false

async function bot(){
    console.log("i loopen...")
    if (dwnld == false) {
        await download()
        console.log("memes nedladdat.")
        dwnld = true
    }
    for (const item of hour){
        console.log("timme och bild",picNum)
        await upload(picNum)
        picNum++
        await timeout(3600000)
    }
    await download()
    console.log("memes nedladdat. ")
    picNum = 1
    bot()

}

bot()
