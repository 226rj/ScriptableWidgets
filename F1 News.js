// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-gray; icon-glyph: magic;
// LatestNews.js

// Get the latest news from f1.com

let headlines = await loadItems()
let widget = await createWidget(headlines)

// Check if the script is running in
// a widget. If not, show a preview of
// the widget to easier debug it.
if (!config.runsInWidget) {
  await widget.presentMedium()
}

// Tell the system to show the widget.
Script.setWidget(widget)
Script.complete()

async function createWidget(alt) {
// add a little red gradient to go over a white background. Feel free to remove and set solid color background
  let gradient = new LinearGradient()
  gradient.locations = [0, 1]
  gradient.colors = [
    new Color("#e10600"),
    new Color("#FFA486")
  ]
  let w = new ListWidget()
  // when clicking on the widget open up the page we're pulling from
  // There might be a way to open apps intead of urls. Not sure
  w.url = "https://www.formula1.com/en/latest.html"
  
  // Add small footer text showing what the widget is. 
  // I don't love this tried at the top as well and just didn't look right. 
  // Can't get the spacing right.
  let title = w.addText("F1 News")
  title.font = Font.boldSystemFont(16)
  title.textColor = Color.white()
  w.addSpacer(6)
  // set white background
  w.backgroundColor = new Color("#ffffff")
  w.backgroundGradient = gradient

  // if we don't have any data show a message and exit
  if(!alt) {
    let fallBackTitle = w.addText("No News")
    fallBackTitle.font = Font.boldSystemFont(16)
    fallBackTitle.textColor = Color.white()
    w.addSpacer()
    return w
  }
  alt.forEach((t,idx) =>{
    let titleTxt = w.addText(t)
    titleTxt.font = Font.mediumSystemFont(14)
    titleTxt.textColor = Color.white()
    // Add spacing below headline.
    if(idx !== alt.length -1){
      w.addSpacer(3)
    }
  })

  return w
}

async function loadItems() {
  // Ths content is property of it's copyright holders. This is for personal use and not for sale. 
  // If you just had an open API people wouldn't have to do this _cough_
  // use https://web.scraper.workers.dev/ to pull in our data.
  let url = "https://web.scraper.workers.dev/?url=https%3A%2F%2Fwww.formula1.com%2Fen%2Flatest.html&selector=.f1-cc&scrape=text&spaced=true&pretty=true"

  let req = new Request(url)
  let json = await req.loadJSON()
  // debug city should get an array of titles back nested in a could objects
  console.log(json)

  // access items
  const items = json.result[".f1-cc"]

  // if we got data then return the first 3 items after you clean up their titles or return null

return items && items.length > 0
  ? items
    .slice(0,2)
    .map(t=> cleanTitle(t))
  : null
}


function cleanTitle(line) {
// remove anything before the : in the title
return line
  .replace(/&#39;/g, "'") // add back single quotes '
  .replace(/^.+:/g, "") // remove everything before : i.e. Vote Poll : [Title]
  .replace("Feature", "") // this seems to not follow the above rule
  .trim() // remove any leading or trailing whitespace
}