const request=require("request");
const cheerio=require("cheerio");
const fs = require("fs");
const path = require("path");
//const { Console } = require("console");
const xlsx = require("xlsx");

function getAllMatch(url) {
    // we have url of score card
    console.log(url);
    
    request(url, cb);
}
function cb(err,res,body){
    if(err){
        console.error("error",err);
    }
    else if (res.statusCode == 404) {
        console.log("Page not found");
      }
    else{
        // console.log(body);
        getmatchdetails(body);
        
    }

    
}
function getmatchdetails(body){
    //select tool contain the html data of ith url
    let selecttool=cheerio.load(body);
   
    let ven=selecttool(".ds-text-tight-m.ds-font-regular.ds-text-ui-typo-mid");
    let descArr = ven.text().split(",");
    //console.log(descArr);
     //obtain venue
     //obtain date
    let dateOfMatch = descArr[2];
    let venueOfMatch = descArr[1];
    console.log(dateOfMatch);
    console.log(venueOfMatch);

    // 3.obtain result
    let matches=selecttool(".ds-text-tight-m.ds-font-regular.ds-truncate.ds-text-typo-title>span")
    let matchResult=matches.text();
    console.log(matchResult);
   // 4.obtaining teams 
    let teamnames=selecttool('a[class="ds-text-ui-typo hover:ds-text-ui-typo-primary ds-block"]');
    //console.log(teamnames.text());
    let ownTeam=selecttool(teamnames[0]).text();
    let opponentTeam =selecttool(teamnames[1]).text();
    

// 5. innings
    let allbatsmentable=selecttool('table[class="ds-w-full ds-table ds-table-xs ds-table-fixed ci-scorecard-table"] tbody');
    //console.log(allbatsmentable.length);   , 2 table for batting
    let htmlString = "";
     for(let i=0;i<allbatsmentable.length;i++){
          //Get the descendants(table columns ) of each element (table row )
     //let allcol=selecttool(allbatsmenrow[i]).find("td");
      //console.log(allbatsmentable.text());
     htmlString = htmlString + selecttool(allbatsmentable[i]).html(); // concatensation of the strings in the form of html

     //find all the descendants named tr tag
     let allRows = selecttool(allbatsmentable[i]).find(".ds-border-b.ds-border-line.ds-text-tight-s");
   // console.log(allRows.text());//data of batsmen and empty row
    
      if (i == 1) {
        let temp = ownTeam;
        ownTeam = opponentTeam;
        opponentTeam = temp;
      }
      console.log(ownTeam);
      console.log(opponentTeam);
      //getting each row one by one 
     // console.log(allRows.length);
     
      for (let i = 0; i < allRows.length-1; i++) {
        let row=selecttool(allRows[i]);
        //for (let i = 0; i < 8; i++) {
        //   if (i == 1 || i == 4) continue;
        //   else {  //column as when i=1 it is empty cell 
        //     console.log(selecTool(row.find("td")[i]).text());
        //   }
        let pn = selecttool(row.find("td")[0]).text().split("");
        // console.log(pn);
        // console.log(pn.join(""));
        let playername = "";
        //Determines whether an array includes a certain element, returning true or false as appropriate.
        if (pn.includes("(")) {
          playername = pn.join("").split("(")[0];
          // console.log(playerName);
        } else if (pn.includes("†")) {
          playername = pn.join("").split("†")[0];
          // console.log(playerName);
        } else playername = pn.join("");
        let run=selecttool(row.find("td")[2]).text();
        let balls=selecttool(row.find("td")[3]).text();
        let nooffour=selecttool(row.find("td")[5]).text();
        let noof6=selecttool(row.find("td")[6]).text();
        let sr = selecttool(row.find("td")[7]).text();
        console.log(
            `playerName -> ${playername}  runsScored ->  ${run}   ballsPlayed ->  ${balls}   numbOfFours -> ${nooffour}    numbOfSixes -> ${noof6}   strikeRate-> ${sr}`
          );
        //console.log(i+" i am inside the row loop");
       
      //  console.log(selecttool(allRows[i]).find("td").text());,print the content of each row 
      // let row = selecTool(allRows[i]);
      //  let firstColmnOfRow = row.find("td")[0];
        // if (selecTool(firstColmnOfRow).hasClass(""))  we can usethis if tds of each player row has different class
      

        processInformation(
            dateOfMatch ,
            venueOfMatch,
            matchResult,
            ownTeam,
            opponentTeam,
            playername,
            run,
            balls,
            nooffour,
            noof6,
            sr
          );
     
     console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        }
    //console.log(htmlString);





   }
}


function processInformation(dateOfMatch,venueOfMatch,matchResult,ownTeam,opponentTeam,playerName,runs,balls,numberOf4,numberOf6,sr) {
    let teamNamePath = path.join(__dirname, "IPL", ownTeam);
    if (!fs.existsSync(teamNamePath)) {
      fs.mkdirSync(teamNamePath);
    }
    let playerPath = path.join(teamNamePath, playerName + ".xlsx");
    let content = excelReader(playerPath, playerName);

    let playerObj = {
      dateOfMatch,
      venueOfMatch,
      matchResult,
      ownTeam,
      opponentTeam,
      playerName,
      runs,
      balls,
      numberOf4,
      numberOf6,
      sr
    };
    content.push(playerObj);
    //this function writes all the content into excel sheet , and places that excel sheet data into playerPath-> rohitSharma.xlsx
    excelWriter(playerPath, content, playerName);
    
  }

  //this function reads the data from excel file
function excelReader(playerPath, sheetName) {
    if (!fs.existsSync(playerPath)) {
      //if playerPath does not exists, this means that we have never placed any data into that file 
      return [];
    }
    //if playerPath already has some data in it 
    let workBook = xlsx.readFile(playerPath);
    //A dictionary of the worksheets in the workbook. Use SheetNames to reference these.
    let excelData = workBook.Sheets[sheetName];
    let playerObj = xlsx.utils.sheet_to_json(excelData);
    return playerObj;
  }
  function excelWriter(playerPath, jsObject, sheetName) {
    //Creates a new workbook
    let newWorkBook = xlsx.utils.book_new();
    //Converts an array of JS objects to a worksheet.
    let newWorkSheet = xlsx.utils.json_to_sheet(jsObject);
    //it appends a worksheet to a workbook
    xlsx.utils.book_append_sheet(newWorkBook, newWorkSheet, sheetName);
    // Attempts to write or download workbook data to file
    xlsx.writeFile(newWorkBook, playerPath);
  }
  
  //visit every scorecard and get info 
  module.exports = {
      gifs:getAllMatch
  }

