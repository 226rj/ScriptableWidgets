// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-gray; icon-glyph: magic;
// Sync F1 Calendar to device
// https://www.formula1.com/en/racing/2022.html

// Change "F1 Calendar" to Calendar name

// Add to home screen
let calName = "F1 Calendar"
// get the calendar 
let cal = await loadCalendar(calName)
// format event data
let event = await formatData(cal)
// build widget
let widget = await createWidget(event)
// Check if the script is running in
// a widget. If not, show a preview of
// the widget to easier debug it.
if (!config.runsInWidget) {
  await widget.presentSmall()
}
// Tell the system to show the widget.
Script.setWidget(widget)
Script.complete()

async function createWidget(alt) {
  let gradient = new LinearGradient()
  gradient.locations = [0, 1]
  gradient.colors = [
    new Color("#e10600"), //top gradient colour
    new Color("#FFA486")  //bottom gradient colour
  ]

  let w = new ListWidget()
  // when widget is clicked it'll take us here in the default browser
  w.url = "https://www.formula1.com/en/racing/2022.html"

  // if you wanted a background image here is how to do that
    //let imgUrl = "https://i.ndtvimg.com/i/2017-11/f1-logo-2018_827x510_81511713381.png"
  //let imgReq = new Request(imgUrl)
  //let img = await imgReq.loadImage()
  //w.backgroundImage = img

    w.backgroundColor = new Color("#ffffff")
    w.backgroundGradient = gradient

  if(!alt) {
    w.addSpacer()
    let fallBackTitle = w.addText("No races for a month")
    fallBackTitle.font = Font.boldSystemFont(16)
    fallBackTitle.textColor = Color.white()
    w.addSpacer()

    return w
  }
  // Add spacer above content to center it vertically.
  //   w.addSpacer()

  // Show headline.
  let titleTxt = w.addText(alt.title)
  titleTxt.font = Font.boldSystemFont(16)
  titleTxt.textColor = Color.white()

  // Add spacing below headline.
  w.addSpacer(8)

  let subtitle = w.addText(alt.loc)
  subtitle.font = Font.mediumSystemFont(12)
  subtitle.textColor = Color.white()
  subtitle.textOpacity = 0.9

  // Add spacing below
  w.addSpacer(2)

  // show date time
  let dateTxt2 = w.addText(alt.startTime)
  dateTxt2.font = Font.mediumSystemFont(12)
  dateTxt2.textColor = Color.white()
  dateTxt2.textOpacity = 0.9
  w.addSpacer(2)

  // Show relative time
  let dateTxt = w.addText(alt.timeUntil)
  dateTxt.font = Font.mediumSystemFont(12)
  dateTxt.textColor = Color.white()
  dateTxt.textOpacity = 0.9
  // Add spacing below content to center it vertically.
  w.addSpacer()
  return w
}


async function loadCalendar(calName){
  // get calendar by name, every time I change it to be friendly it gets reset.
  let cal = await Calendar.forEventsByTitle(calName);
  let today = new Date(Date.now())
  // 30 days from now. This will probably show wonky stuff once season is over
  let nextMonth = today.valueOf() + 2592000000;
  let events = await CalendarEvent.between(today, new Date(nextMonth), [cal])    

  return events
}

// take f1 calendar and get the most recent event and format it. 
// lots of dumb TimeZone stuff I'm pretty sure I got wrong, but close enough.
async function formatData(events){
  let today = new Date(Date.now())

  // time zone stuff that's not needed bc Calendar app handles this
  let tzOffsetHour = today.getTimezoneOffset() / 60;

  //     today.setHours(today.getHours() - tzOffsetHour)
  let nextMonth = today.valueOf() + 2592000000;
  const dtOpts = {
    hour: "numeric", 
    dayPeriod: "short",
    month: "short",
    day: "numeric"
  };
  const fmt = new Intl.DateTimeFormat('en-US', dtOpts)
  const rtf = new Intl.RelativeTimeFormat("en",  {style: "narrow"})

  // no events found. return nothing. should handle on display side
  if(events && events.length === 0) {
    return null
  }
  const nextEvent = events[0]

  let unit
  let timeVal
  const startTime = new Date(Date.parse(nextEvent.startDate))

  // Timezone stuff that I think works but don't need
  //     startTime
  //     .setHours(startTime.getHours() - tzOffsetHour)

  // time until the event starts in ms
  const startTimeUntil = startTime.valueOf() - today.valueOf()

  // figure out the unit to use the Intl formatter with
  if(startTimeUntil > 86400000) {
    timeVal = startTimeUntil / 1000 / 60 / 60 / 24
    unit = "day"
  } else if (startTimeUntil > 3600000) {
    timeVal = startTimeUntil / 1000 / 60 / 60
    unit = "hour"
  } else {
    timeVal = startTimeUntil / 1000 / 60
    unit = "minute"
  }


  // # debug life
  console.log(JSON.stringify({
    today,
    tzOffsetHour,
    startTime, 
    startTimeUntil,
    timeVal, 
    unit, 
    nextEvent
  }, null, 2))

  let timeUntil = rtf.formatToParts(timeVal, unit)
  // only get the text and whole numbers spaces come apart of the formatted value btw
  let timeUntilFmt = timeUntil.filter(t => t.type === 'literal' || t.type === 'integer')
                              .map(t => t.value).join('')

  // # debug life
  console.log(JSON.stringify({
    timeUntil,
    timeUntilFmt,
    startTime
  }, null, 2))

  return {
    title: nextEvent.title,
    loc: nextEvent.location,
    timeUntil: timeUntilFmt,
    startTime: fmt.format(startTime)
  }
}
