const request=require("request");
const cheerio=require("cheerio");
// 1.const getScorecardObj = require("./scorecards");
//another way below
const {gifs} = require("./scorecard");
//holding the arguments from main.js that was fulllink
function getAllMatch(url) {

    console.log(url);
    //request("https://www.espncricinfo.com/series/ipl-2020-21-1210595",cb); samw as below
    request(url, cb);
}

function cb(err,res,body){
     if(err){
         console.error("error",err);
     }
     else{
         //console.log(res);
        //console.log(body);
         extractmatchdetails(body);
         
     }

     
}
function extractmatchdetails(body){
    //store the html data in selecttool
    let selecttool=cheerio.load(body);
    //selector,kindly visit the site to know more
    let anchorele=selecttool('div[class="ds-flex ds-mx-4 ds-pt-2 ds-pb-3 ds-space-x-4 ds-border-t ds-border-line-default-translucent"]');
    console.log(anchorele.length);
    for(let i=0;i<anchorele.length;i++)
   { 
    let imp=selecttool(anchorele[i]).children('span').last().prev().html();
    //console.log(imp);
   
   let halflink=imp.split(' ')[1].split('="')[1].split('"')[0];
   //console.log(i +"  is "+ halflink);
   let fulllink="https://www.espncricinfo.com"+halflink;
   //console.log(fulllink);
   gifs(fulllink);
// getScorecardObj.gifs(fullLink);
        
}
    //console.log(anchorele.length);
    
   
    //console.log(allscore.html());
    
}




//exports data from allmatch.js 
module.exports = {
    getAllMatch: getAllMatch
  };