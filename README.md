# mapillary_photostories
Tell your stories with photos

##Getting started
    Do not change the file name photostories reads the story or background from. You can fork your own story map and change this if you wish, otherwise overwrite story.json and story-background.jpg.

  - Clone the repository
  - cd in to the folder
  - run a server (for example python -m SimpleHTTPServer ) and go to localhost in a web browser (Chrome works best with MapillaryJS)
  - You should see the example content under stories/your_story, e.g. [rio](http://localhost:8000/stories/rio/)

##How to add your own Story

  - clone one of the stories under /stories
  - adjust the story.json, and cover.jpg
  - you shouldn't need to touch index.html
  
###In case there is any section that you don't want to use in your story, don't delete it! instead just leave that section as "".

  - These are the sections in the json file that you can change:

    - mainTitle: the title a user sees when they first see the page
    - frontPageDescription: the description a user sees when they first see the page
    - intro: this section shows up between the cover and the mapillary_photostories
    - author: name of the author
    - date: date of publication
    - keys: a list of the keys plus their titles and descriptions
      -key: a sequence key
      -title: title of this section
      -description: description of this location or sequence
  - imagedescriptions: Image key and  description to appear at only those images in the Mapillary viewer.
