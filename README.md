# Setup

git clone https://github.com/leob/ionic-quickstarter
mv ionic-quickstarter myapp
cd myapp

edit ionic.project
edit config.xml

npm install
bower install
ionic state restore --plugins

ionic platform add android

ionic serve
