let url="https://github.com/topics";
const request=require('request');
const cheerio=require('cheerio');
const fs=require("fs");
const path=require("path");
const pdfkit=require("pdfkit");
request(url,cb);
function cb(err,response,html)
{
    if(err) console.log(err);
    else if(response.statusCode==404) console.log('page not found');
    else getlinks(html);
}
function getlinks(html)
{
    let $=cheerio.load(html);
    let linkarr=$(".no-underline.d-flex.flex-column.flex-justify-center");
    for(let i=0;i<linkarr.length;i++)
    {
        let href=$(linkarr[i]).attr("href");
        let flink=`https://github.com/${href}`;
        let topic=href.split("/").pop();
        // console.log(flink,topic);
        getrepo(flink,topic);
    }
}
function getrepo(url,topic)
{
    request(url,cb);
    function cb(err,response,html)
    {
        if(err) console.log(err);
        else if(response.statusCode==404) console.log('page not found');
        else getrepolink(html);
    }
    function getrepolink(html)
    {
        let $=cheerio.load(html);
        let headarr=$(".text-bold.wb-break-word");
        // console.log(topic);
        for(let i=0;i<5;i++)
        {
            let link=$(headarr[i]).attr("href");
            let flink=`https://github.com${link}/issues`;
            let reponame=link.split("/").pop();
            // console.log(flink)
            getissue(flink,topic,reponame);
        }
    }
    function getissue(url,topic,reponame)
    {
        request(url,cb);
        function cb(err,response,html)
        {
            if(err) console.log(err);
            else if(response.statusCode==404) console.log('page not found');
            else gfun(html);
        }
        function gfun(html)
        {
            let $=cheerio.load(html);
            let issuearr=$(".Link--primary.v-align-middle.no-underline.h4.js-navigation-open.markdown-title");
            let arr=[];
            for(let i=0;i<issuearr.length;i++)
            {
                let link=$(issuearr[i]).attr("href");
                arr.push(link);
            }
            let folderpath=path.join(__dirname,topic);
            if(fs.existsSync(folderpath)==false) fs.mkdirSync(folderpath);
            let filepath=path.join(folderpath,reponame+".json");
            let filepath2=path.join(folderpath,reponame+".pdf");
            fs.writeFileSync(filepath,JSON.stringify(arr));
            
            let text=JSON.stringify(arr);
            let pdfdoc=new pdfkit();
            pdfdoc.pipe(fs.createWriteStream(filepath2));
            pdfdoc.text(text);
            pdfdoc.end();
        }
    }
}