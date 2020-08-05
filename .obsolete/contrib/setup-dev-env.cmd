
echo "make sure you have node 8.x or higher installed"
echo "this script will install the newest versions of global packages.  hit ctrl-c to cancel"
echo "packages to update: typescript mocha tslint node-dev nodemon"
pause
npm r -g typescript mocha tslint node-dev nodemon
npm i -g typescript mocha tslint node-dev nodemon
