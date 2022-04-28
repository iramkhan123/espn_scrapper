const request=require("request");
const cheerio=require("cheerio");
const path=require("path");
//accessing data from another page i.e, allmatch.js and main.js will invoke all the function of allmatch.js
//so we only require to run node main.js for executing even the allmatch.js 
const allMatchObj = require("./allmatch");
const fs=require("fs");
let url="https://www.espncricinfo.com/series/ipl-2020-21-1210595";

request(url,cb);
function cb(err,res,body){
     if(err){
         console.error("error",err);
     }
     else{
         handlehtml(body);
     }

}
//to get the address of the espn_scrapper directory we may also use 
//C:\Users\asus\Desktop\webscrapping\espn_scrapper , very basic way 
let iplPath = path.join(__dirname,"IPL");
if (!fs.existsSync(iplPath)) {
  fs.mkdirSync(iplPath);
}

function handlehtml(body){
    let selecttool=cheerio.load(body);
    //there are many ways to access the selector in case of class it is accesssed by using . and in case of
    //ids it is accessed using #, and below mentioned is also a way to access a selector in js
   let anchorele=selecttool('a[class="ds-block ds-text-center ds-uppercase ds-text-ui-typo-primary ds-underline-offset-4 hover:ds-underline hover:ds-decoration-ui-stroke-primary ds-block"]');
    // this print everything about the tags or any info regarding it.
    //console.log(anchorele);
    //method for getting all the attribute and their values
    let relativelink=anchorele.attr("href");
    //link to another page (view all results)
    let fulllink = "https://www.espncricinfo.com" + relativelink;
    //console.log(fulllink);
    //the fulllink are passed to function of allmatch.js
    allMatchObj.getAllMatch(fulllink);

}
