YouShire
========

##TODO:

bot.js : is to simulate how users would interact in question creating and replying. It is done on single user version on looply behaviour so far. It needs to extand by simulating multiple users bots interact with each other in a pool. 

user management: 

1. show username in the top banner. create a common method to put req.user into argument when render page. 
2. 


## DEMOs
1. /view/question_all/: to view all user-related questions. 
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
