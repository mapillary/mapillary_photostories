# mapillary_photostories
Tell your stories with photos

##Getting started 
  - Clone the repository
  - cd in to the folder
  - run a server (for example python -m SimpleHTTPServer ) and go to localhost in a web browser (Chrome works best with MapillaryJS)
  - You should see the example content!

##How to Add Your Stories

  - Open sequence_list.json in your favorite text editor.

  - Save the structure in the sequence list, and your text and sequence keys

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
  
