// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-gray; icon-glyph: magic;

// create new Calendar in your calendar app
// add events you want to have a countdown for
// change calName to the name of your Calendar
// add to homescreen for a countdown to events

// NOTE
// Works with any even. i just used it for an exam countdown
let calName = "Exam timetable"
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
  await widget.presentMedium()
}
// Tell the system to show the widget.
Script.setWidget(widget)
Script.complete()

async function createWidget(alt) {
  let gradient = new LinearGradient()
  gradient.locations = [0, 1]
  gradient.colors = [
    new Color("#e10600"), // Widget gradient background colour from top
    new Color("#FFA486"), // widget gradient backround colour from bottom
  ]

  let w = new ListWidget()
  // when widget is clicked it'll take us here // in // the default browser 
// w.url = ""


    w.backgroundColor = new Color("#ffffff")
    w.backgroundGradient = gradient

  if(!alt) {
    w.addSpacer()
    let fallBackTitle = w.addText("No Upcomming Events")
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
  let events = await CalendarEvent.between(today, new Date(2022, 6, 24), [cal])    

  return events
}

// take chosen calendar and get the most recent event and format it. 

async function formatData(events){
  let today = new Date(Date.now())

  let tzOffsetHour = today.getTimezoneOffset() / 60;


  let nextMonth = today.valueOf() + 2592000000;
  const dtOpts = {
    hour: "numeric", 
    dayPeriod: "short",
    month: "short",
    day: "numeric"
  };
  const fmt = new Intl.DateTimeFormat('en-US', dtOpts)
  const rtf = new Intl.RelativeTimeFormat("en",  {style: "narrow"})

  if(events && events.length === 0) {
    return null
  }
  const nextEvent = events[0]

  let unit
  let timeVal
  const startTime = new Date(Date.parse(nextEvent.startDate))

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
