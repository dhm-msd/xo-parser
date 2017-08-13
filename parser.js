/**
 * Created by Dhm on 13/8/2017.
 */
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs')
var xlsx = require('node-xlsx')
//https://www.xo.gr/dir-az/G/Gymnastiria/Athina/?page=7
var options = {
    host: 'https://www.xo.gr',
    start_path: '/dir-az/G/Gymnastiria/Attiki/'
}

var start_url = options.host+options.start_path
var Gyms = []
var xlsx_output_file = "gyms.xlsx"


handlePage(start_url,function(){
    const data = Gyms;
    var buffer = xlsx.build([{name: "mySheetName", data: data}]); // Returns a buffer
    fs.writeFile(xlsx_output_file, buffer,  "binary",function(err) {
        console.log('Saved data to : '+xlsx_output_file)

    });

})

function handlePage(url,callback){
    console.log("Getting URL:"+url)
    request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            if($('#SearchResults .page_next')[0]) {
                var next_page = $('#SearchResults .page_next')[0].attribs.href;
            }
            $('#SearchResults .listResults .links_list').each(function(i, element){
                if(element.children.length>1) {
                    var cur_listing = element.children[1];
                    var loc_of_bussName = 0
                    var loc_of_bussArea = 0
                    var loc_of_bussPhone = 0
                    if (!cur_listing) {
                        console.log("gmm")
                    }
                    if (cur_listing.children.length === 11) {
                        if (cur_listing.children[1].attribs.class == "listingSOA") {
                            loc_of_bussName = 3;
                            loc_of_bussArea = 7;
                        } else {
                            loc_of_bussName = 1;
                            loc_of_bussArea = 5;
                        }
                        loc_of_bussPhone = 9;

                    } else if (cur_listing.children.length === 9) {
                        loc_of_bussName = 1;
                        loc_of_bussArea = 5;
                        loc_of_bussPhone = 7;
                    }
                    if (!cur_listing.children[loc_of_bussName].children[1]) {
                        console.log('wtf');
                    }
                    var bussName = cur_listing.children[loc_of_bussName].children[1].children[1].children[0].children[0].data
                    var bussArea = cur_listing.children[loc_of_bussArea].children[1].children[1]
                    var x = 0;
                    var bussLoc = "";
                    while (x <= bussArea.children.length - 1) {
                        if (bussArea.children[x].children[0]) {
                            bussLoc += bussArea.children[x].children[0].data + " "
                        }
                        x = x + 2;
                    }
                    if (cur_listing.children[9]) {
                        var bussPhone = cur_listing.children[9].children[1].children[1].children[1].children[3].children[3].children[1].children[1].children[1].children[0].children[0].data
                    } else {
                        var bussPhone = cur_listing.children[loc_of_bussPhone].children[1].children[1].children[1].children[3].children[3].children[1].children[1].children[1].children[0].children[0].data
                    }
                    var a_gym = []
                    a_gym[0] = bussName;
                    a_gym[1] = bussPhone;
                    a_gym[2] = bussLoc;
                    Gyms.push(a_gym);
                    //console.log(bussName + " " + bussPhone + "\r\n" + bussLoc);
                }
            });
            if(next_page){
                handlePage(options.host+next_page,callback)
            }else{
                callback()
            }
        }
    });
}