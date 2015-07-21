var fs = require('fs');
var ejs = require('ejs');
var csvFile = fs.readFileSync('friend_list.csv', 'utf8');
var tumblr = require('tumblr.js');
var emailTemplate = fs.readFileSync('email_template.ejs', 'utf8');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('XXXXXXXXXXXXXX');

function csvParse(file){
	var arr = [];
	var contacts = file.split('\n');
	var header = contacts[0].split(',');
		for(var i = 1; i < contacts.length; i++){
			var each = contacts[i].split(",");
			var obj = {};
			obj[header[0]] = each[0];
			obj[header[1]] = each[1];
			obj[header[2]] = each[2];
			obj[header[3]] = each[3];
			arr.push(obj);
	}
	return arr;
}

friendList = csvParse(csvFile);
// Authenticate via OAuth
var client = tumblr.createClient({
  consumer_key: 'XXXXXXXXXXXXXX',
  consumer_secret: 'XXXXXXXXXXXXXX',
  token: 'XXXXXXXXXXXXXX',
  token_secret: 'XXXXXXXXXXXXXX'
});

var latestPosts = [];
client.posts('mikuyabingecoding707', function(err, blog){
	//friendList = csvParse(csvFile);
  for(var i = 0; i < blog.posts.length; i++){
 	var post = blog.posts[i];
 	//post.date is not a date object, it is a string. 
 	//new Date().valueof() returns time in number of miliseconds, Date.parse() returns number in the same format
 	//a day can be represented in miliseconds as "1000*60*60*24"
 	//fiLter posts objects from blog object to include posts no later than 7 days in latestPosts.
  	if ((new Date().valueOf() - Date.parse(post.date))/(1000*60*60*24) <= 7){	
		latestPosts.push(post);
	}
	}
	//because client.posts is an asynchronous method, it is not going to work sequentially
	//with firendList.forEach method, thus including this function inside of client.posts.
	friendList.forEach(function(row){
	var firstName = row["firstName"];
	var numMonthsSinceContact = row["numMonthsSinceContact"];
	//making a copy of email template
	var copy = emailTemplate;

	var customizedTemplate = ejs.render(copy, 
		{
			"firstName": firstName,
			"numMonthsSinceContact": numMonthsSinceContact,
			"latestPosts": latestPosts
		});
	//console.log(customizedTemplate);
	sendEmail(firstName, row["emailAddress"], "Karen M.", "karen.mao707@gmail.com", "Hi there, check out something cool", customizedTemplate);	
})

});

 function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
    var message = {
        "html": message_html,
        "subject": subject,
        "from_email": from_email,
        "from_name": from_name,
        "to": [{
                "email": to_email,
                "name": to_name
            }],
        "important": false,
        "track_opens": true,    
        "auto_html": false,
        "preserve_recipients": true,
        "merge": false,
        "tags": [
            "Fullstack_Tumblrmailer_Workshop"
        ]    
    };
    var async = false;
    var ip_pool = "Main Pool";
    mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
        // console.log(message);
        // console.log(result);   
    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });
 }

//console.log(friendList.latestPosts);
//console.log(latestPosts);

// friendList.forEach(function(row){
// 	var copy = emailTemplate;
// 	console.log(friendList.latestPosts);
// 	var customizedTemplate = ejs.render(copy, {
// 		firstName: row["firstName"],
// 		numMonthsSinceContact: row["numMonthsSinceContact"],
// 		latestPosts: latestPosts
// 	})
// 	console.log(customizedTemplate);
// });

<!--//below is home grown replace function implemented first-->
// friendList = csvParse(csvFile);

// friendList.forEach(function(row){

//     var firstName = row["firstName"];
//     var numMonthsSinceContact = row["numMonthsSinceContact"];

//     // we make a copy of the emailTemplate variable to a new variable to ensure
//        // we don't edit the original template text since we'll need to us it for 
//        // multiple emails

//     var templateCopy = emailTemplate;

//     // use .replace to replace FIRST_NAME and NUM_MONTHS_SINCE_CONTACT with firstName and  monthsSinceLastContact  
//     templateCopy = templateCopy.replace(/FIRST_NAME/gi,
//     firstName).replace(/NUM_MONTHS_SINCE_CONTACT/gi, numMonthsSinceContact);

//     console.log(templateCopy);

// })

// var csv_data = csvParse(csvFile);
// console.log(csv_data);