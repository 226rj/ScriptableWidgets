// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;
async function createWidget() {
  // Create new empty ListWidget instance
  let gradient = new LinearGradient()
  gradient.locations = [0, 1]
  gradient.colors = [
    new Color("#e10600"), //top gradient colour
    new Color("#FFA486")  //bottom gradient colour
  ]
  
  let listwidget = new ListWidget();  
  listwidget.backgroundColor = new Color("#ffffff")
  listwidget.backgroundGradient = gradient
  
  listwidget.url = "notion://" // replace with desired app path
// Examples:
// Calendar = calshow://
// Notion = notion://
// Snapchat = snapchat://
// Instagram = instagram://
// Twitter = twitter://
// Messages = messages://

let heading = listwidget.addText("Notion"); // text  displayd
  heading.centerAlignText(); // Font allignment
  heading.font = Font.boldSystemFont(16); // font style and size
  heading.textColor = new Color("#ffffff"); // Font colour
  // Return the created widget
  return listwidget;
}

let widget = await createWidget();

// Check where the script is running
if (config.runsInWidget) {
  // Runs inside a widget so add it to the homescreen widget
  Script.setWidget(widget);
} else {
  // Show the medium widget inside the app
  widget.presentSmall();
}
Script.complete();