YouShire
========

##TODO:

bot.js : is to simulate how users would interact in question creating and replying. It is done on single user version on looply behaviour so far. It needs to extand by simulating multiple users bots interact with each other in a pool. 

user management: 

1. show username in the top banner. create a common method to put req.user into argument when render page. 
2. object_id need to removed as reference, it should just use string instead. 


## DEMOs
0. home page to login or register
1. node user_insert.js to insert usres. 
1. user_profile page to view questions related. 
2. user initial a question.
3. view question be initialise: the reply can not be display correctly. when view the question, the autohor_id should replaced by user name. to reply a message, should use sio to trick a event, rather than refresh the whole page. 
4. simulater: goto /observer/question/
5. node user_bot.js


1
. /view/question_all/: to view all user-related questions. 
2. /view/question_single/?m_id…: to view replys to a a questions. 
3. /create/question/: to create a question with gmap to locate the latlng, if it is on mobile, then it would automatically identified. 
4. reply. 
5. user interaction simulation:
6. 



## INFO

installs:

1. nodejs: https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager
2. mongodb: http://docs.mongodb.org/manual/installation/

runs: 

1. install depedence: npm install
2. run nodejs monitoring: supervisor app.js
3. run simulator: node bot.js


create architecture:
>$ express

run with code monitoring:
>$ supervisor app.js

start mongodb server: // require mongodb.version > 2.2 to use aggregation function. 
>$ sudo mongod

mongodb can be installed with homebrew or packaged. 
